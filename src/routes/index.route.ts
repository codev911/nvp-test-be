import { Router } from 'express';
import appRouter from './app.route';
import authRouter from './auth.route';

const router = Router();

router.use('/', appRouter);
router.use('/auth', authRouter);

export default router;
