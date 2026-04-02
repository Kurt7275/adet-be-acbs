import { Hono } from 'hono';
import * as studentController from '../controllers/student.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

router.use('*', authMiddleware);
router.use('*', roleMiddleware(['STUDENT', 'ADMIN']));

router.get('/profile', studentController.getStudentProfile);
router.post('/profile', studentController.updateStudentProfile);

export default router;