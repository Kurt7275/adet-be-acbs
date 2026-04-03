import { Hono } from 'hono';
import * as studentController from '../controllers/student.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

// Protected - Get my profile
router.get('/me', authMiddleware, roleMiddleware(['STUDENT']), studentController.getMyProfile);

// Protected - Update my profile
router.put('/me', authMiddleware, roleMiddleware(['STUDENT']), studentController.updateMyProfile);

export default router;