import { Router } from 'express';
import { getNotifications, markNotificationsRead } from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const notificationRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get('/', getNotifications);
notificationRouter.patch('/read', markNotificationsRead);

export default notificationRouter;
