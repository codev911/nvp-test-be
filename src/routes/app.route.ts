import { Router } from 'express';
import { AppHealth } from '../controllers/app.controller';

const appRouter = Router();

appRouter.get('', AppHealth);

export default appRouter;
