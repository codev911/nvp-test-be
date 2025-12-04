import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import appRouter from './app.route';
import authRouter from './auth.route';
import employeeRouter from './employee.route';

const router = Router();

router.use('/', appRouter);
router.use('/auth', authRouter);
router.use('/employee', authMiddleware, employeeRouter);

export default router;
