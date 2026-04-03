import { Hono } from 'hono';
import * as teacherController from '../controllers/teacher.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

// Public - Get all teachers
router.get('/', teacherController.getAllTeachers);

// Public - Get single teacher
router.get('/:id', teacherController.getTeacherById);

// Protected - Update own teacher profile
router.put('/profile', authMiddleware, roleMiddleware(['TEACHER']), teacherController.updateTeacherProfile);

export default router;