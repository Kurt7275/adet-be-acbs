import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const studentSchema = z.object({
  grade: z.string().optional(),
  school: z.string().optional(),
  subjects: z.array(z.string()).optional(),
});

// GET my student profile
export const getMyProfile = async (c: Context) => {
  try {
    const user = c.get('user') as any;

    const student = await prisma.user.findUnique({
      where: { id: user.id },
      include: { student: true },
    });

    if (!student) {
      return c.json({ error: 'Student profile not found' }, 404);
    }

    return c.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return c.json({ error: 'Failed to fetch student profile' }, 500);
  }
};

// UPDATE my student profile
export const updateMyProfile = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();

    const validated = studentSchema.parse(data);

    const student = await prisma.user.update({
      where: { id: user.id },
      data: {
        student: {
          upsert: {
            create: validated,
            update: validated,
          },
        },
      },
      include: { student: true },
    });

    return c.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Error updating student profile:', error);
    return c.json({ error: 'Failed to update student profile' }, 500);
  }
};