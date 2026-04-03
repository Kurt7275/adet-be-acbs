import { Context } from 'hono';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const bookingSchema = z.object({
  teacherId: z.string().uuid(),
  consultationDate: z.string().datetime(),
  reason: z.string().min(10),
  specialization: z.string().min(1),
});

// CREATE booking (students only)
export const createBooking = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();

    const validated = bookingSchema.parse(data);

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: validated.teacherId },
    });
    if (!teacher || teacher.role !== 'TEACHER') {
      return c.json({ error: 'Teacher not found' }, 404);
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: user.id,
        teacherId: validated.teacherId,
        consultationDate: new Date(validated.consultationDate),
        reason: validated.reason,
        specialization: validated.specialization,
        status: 'PENDING',
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    return c.json(booking, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: error.errors }, 400);
    }
    console.error('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
};

// GET my bookings (students) or bookings for me (teachers)
export const getMyBookings = async (c: Context) => {
  try {
    const user = c.get('user') as any;

    let bookings;
    if (user.role === 'STUDENT') {
      bookings = await prisma.booking.findMany({
        where: { studentId: user.id },
        include: { teacher: true },
      });
    } else if (user.role === 'TEACHER') {
      bookings = await prisma.booking.findMany({
        where: { teacherId: user.id },
        include: { student: true },
      });
    }

    return c.json(bookings || []);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
};

// GET single booking
export const getBookingById = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const { id } = c.req.param();

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { student: true, teacher: true },
    });

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    // Check if user has access to this booking
    if (user.role === 'STUDENT' && booking.studentId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    if (user.role === 'TEACHER' && booking.teacherId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return c.json({ error: 'Failed to fetch booking' }, 500);
  }
};

// APPROVE booking (teachers only)
export const approveBooking = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const { id } = c.req.param();

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.teacherId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { student: true, teacher: true },
    });

    return c.json(updated);
  } catch (error) {
    console.error('Error approving booking:', error);
    return c.json({ error: 'Failed to approve booking' }, 500);
  }
};

// REJECT booking (teachers only)
export const rejectBooking = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const { id } = c.req.param();

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.teacherId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: { student: true, teacher: true },
    });

    return c.json(updated);
  } catch (error) {
    console.error('Error rejecting booking:', error);
    return c.json({ error: 'Failed to reject booking' }, 500);
  }
};

// CANCEL booking (students only)
export const cancelBooking = async (c: Context) => {
  try {
    const user = c.get('user') as any;
    const { id } = c.req.param();

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    if (booking.studentId !== user.id) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { student: true, teacher: true },
    });

    return c.json(updated);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return c.json({ error: 'Failed to cancel booking' }, 500);
  }
};