import http from 'node:http';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { connectToDatabase } from './database/mongo.database';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware';
import { responseInterceptor } from './middlewares/response-interceptor.middleware';
import router from './routes/index.route';
import { CORS_ORIGIN, PORT } from './utils/configs/env.config';
import { setupSwagger } from './utils/configs/swagger.config';
import logger from './utils/log.util';
import { initNotificationWebsocket } from './websocket/notification.websocket';

async function main(): Promise<Express> {
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

  // API documentation
  setupSwagger(app);

  // Global response interceptor
  app.use(responseInterceptor);

  // Connect to MongoDB
  await connectToDatabase();

  // Routes
  app.use('/', router);

  // 404 Handler - must be after all routes
  app.use(notFoundHandler);

  // Global Error Handler - must be last
  app.use(errorHandler);

  return app;
}

// Start server
main()
  .then((app: Express) => {
    const server = http.createServer(app);
    initNotificationWebsocket(server);
    server.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error('Failed to start the server.', { error });
    process.exit(1);
  });
