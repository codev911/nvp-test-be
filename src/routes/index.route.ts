import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import appRouter from './app.route';
import authRouter from './auth.route';
import employeeRouter from './employee.route';
import notificationRouter from './notification.route';

const router = Router();

router.use('/', appRouter);
router.use('/auth', authRouter);
router.use('/employee', authMiddleware, employeeRouter);
router.use('/notifications', notificationRouter);

export default router;
