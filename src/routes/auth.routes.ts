import { Hono } from 'hono';
import * as authController from '../controllers/auth.controller';

const router = new Hono();

router.post('/google', authController.googleLogin);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

export default router;