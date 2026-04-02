import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      },
    });

    return c.json(teachers);
  } catch (error) {
    return c.json({ error: 'Failed to fetch teachers' }, 500);
  }
};

export const getTeacherById = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const teacher = await prisma.user.findUnique({
      where: { id },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return c.json({ error: 'Teacher not found' }, 404);
    }

    return c.json(teacher);
  } catch (error) {
    return c.json({ error: 'Failed to fetch teacher' }, 500);
  }
};

export const getTeacherAvailability = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const availability = await prisma.availability.findMany({
      where: { teacherId: id },
    });

    return c.json(availability);
  } catch (error) {
    return c.json({ error: 'Failed to fetch availability' }, 500);
  }
};

export const updateTeacherProfile = async (c: Context) => {
  try {
    const user = c.get('user');
    const data = await c.req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return c.json(updated);
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 500);
  }
};

export const setAvailability = async (c: Context) => {
  try {
    const user = c.get('user');
    const { startTime, endTime, dayOfWeek } = await c.req.json();

    const availability = await prisma.availability.create({
      data: {
        teacherId: user.id,
        dayOfWeek,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return c.json(availability);
  } catch (error) {
    return c.json({ error: 'Failed to set availability' }, 500);
  }
};