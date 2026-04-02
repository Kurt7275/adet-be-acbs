import { Hono } from 'hono';
import * as teacherController from '../controllers/teacher.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.get('/:id/availability', teacherController.getTeacherAvailability);

router.use('*', authMiddleware);
router.use('*', roleMiddleware(['TEACHER', 'ADMIN']));

router.post('/profile', teacherController.updateTeacherProfile);
router.post('/availability', teacherController.setAvailability);

export default router;