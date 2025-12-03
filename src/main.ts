import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { CORS_ORIGIN, PORT } from './configs/env.config';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware';
import { responseInterceptor } from './middlewares/response-interceptor.middleware';
import router from './routes/index.route';
import logger from './utils/log.util';

const app: Express = express();

// Security middlewares - should be first
app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Global response interceptor
app.use(responseInterceptor);

// Routes
app.use('/', router);

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Backend server started successfully at http://localhost:${PORT}`);
});

export default app;
