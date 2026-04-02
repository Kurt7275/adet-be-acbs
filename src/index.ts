import { Hono } from 'hono';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './middleware/logger.middleware';

dotenv.config();

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use('*', logger);

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/teachers', teacherRoutes);
app.route('/api/students', studentRoutes);
app.route('/api/bookings', bookingRoutes);
app.route('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError(errorHandler);

const port = process.env.PORT || 3000;
console.log(`🚀 Server is running on http://localhost:${port}`);

export default app;