import { Hono } from 'hono';
import * as bookingController from '../controllers/booking.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

// CREATE booking (students only)
router.post('/', authMiddleware, roleMiddleware(['STUDENT']), bookingController.createBooking);

// GET my bookings
router.get('/', authMiddleware, bookingController.getMyBookings);

// GET single booking
router.get('/:id', authMiddleware, bookingController.getBookingById);

// APPROVE booking (teachers only)
router.patch('/:id/approve', authMiddleware, roleMiddleware(['TEACHER']), bookingController.approveBooking);

// REJECT booking (teachers only)
router.patch('/:id/reject', authMiddleware, roleMiddleware(['TEACHER']), bookingController.rejectBooking);

// CANCEL booking (students only)
router.patch('/:id/cancel', authMiddleware, roleMiddleware(['STUDENT']), bookingController.cancelBooking);

export default router;