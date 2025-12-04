import { Router } from 'express';
import { authAdmin, authMe } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/login', authAdmin);
authRouter.get('/me', authMiddleware, authMe);

export default authRouter;
