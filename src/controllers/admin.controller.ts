import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (c: Context) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return c.json(users);
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
};

export const getSystemStats = async (c: Context) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const approvedBookings = await prisma.booking.count({
      where: { status: 'APPROVED' },
    });

    return c.json({
      totalUsers,
      totalBookings,
      approvedBookings,
      pendingBookings: totalBookings - approvedBookings,
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
};

export const updateUserRole = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { role } = await c.req.json();

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return c.json(user);
  } catch (error) {
    return c.json({ error: 'Failed to update user role' }, 500);
  }
};