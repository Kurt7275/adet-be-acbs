import { Hono } from 'hono';
import * as adminController from '../controllers/admin.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = new Hono();

router.use('*', authMiddleware);
router.use('*', roleMiddleware(['ADMIN']));

router.get('/users', adminController.getAllUsers);
router.get('/stats', adminController.getSystemStats);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;