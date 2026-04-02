import { Hono } from 'hono';
import * as bookingController from '../controllers/booking.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

router.use('*', authMiddleware);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);
router.patch('/:id/cancel', bookingController.cancelBooking);

router.use('*', roleMiddleware(['TEACHER', 'ADMIN']));
router.patch('/:id/approve', bookingController.approveBooking);
router.patch('/:id/reject', bookingController.rejectBooking);

export default router;