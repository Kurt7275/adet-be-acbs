import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStudentProfile = async (c: Context) => {
  try {
    const user = c.get('user');

    const student = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return c.json(student);
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
};

export const updateStudentProfile = async (c: Context) => {
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