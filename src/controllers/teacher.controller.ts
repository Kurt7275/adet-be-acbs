import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const teacherSchema = z.object({
  specialization: z.string().min(1),
  bio: z.string().optional(),
  availability: z.array(z.object({
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
});

// GET all teachers
export const getAllTeachers = async (c: Context) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        teacher: true,
      },
    });

    return c.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return c.json({ error: 'Failed to fetch teachers' }, 500);
  }
};

// GET single teacher by ID
export const getTeacherById = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const teacher = await prisma.user.findUnique({
      where: { id },
      include: { teacher: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return c.json({ error: 'Teacher not found' }, 404);
    }

    return c.json(teacher);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return c.json({ error: 'Failed to fetch teacher' }, 500);
  }
};

// UPDATE teacher profile (only logged-in teacher)
export const updateTeacherProfile = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();

    const validated = teacherSchema.parse(data);

    const teacher = await prisma.user.update({
      where: { id: user.id },
      data: {
        teacher: {
          upsert: {
            create: validated,
            update: validated,
          },
        },
      },
      include: { teacher: true },
    });

    return c.json(teacher);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Error updating teacher profile:', error);
    return c.json({ error: 'Failed to update teacher profile' }, 500);
  }
};