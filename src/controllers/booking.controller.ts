import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (c: Context) => {
  try {
    const user = c.get('user');
    const { teacherId, consultationDate, reason, specialization } = await c.req.json();

    const booking = await prisma.booking.create({
      data: {
        studentId: user.id,
        teacherId,
        consultationDate: new Date(consultationDate),
        reason,
        specialization,
        status: 'PENDING',
      },
    });

    return c.json(booking);
  } catch (error) {
    return c.json({ error: 'Failed to create booking' }, 500);
  }
};

export const getMyBookings = async (c: Context) => {
  try {
    const user = c.get('user');

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { studentId: user.id },
          { teacherId: user.id },
        ],
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    return c.json(bookings);
  } catch (error) {
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
};

export const getBookingById = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    return c.json(booking);
  } catch (error) {
    return c.json({ error: 'Failed to fetch booking' }, 500);
  }
};

export const approveBooking = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    return c.json(booking);
  } catch (error) {
    return c.json({ error: 'Failed to approve booking' }, 500);
  }
};

export const rejectBooking = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return c.json(booking);
  } catch (error) {
    return c.json({ error: 'Failed to reject booking' }, 500);
  }
};

export const cancelBooking = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return c.json(booking);
  } catch (error) {
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
};