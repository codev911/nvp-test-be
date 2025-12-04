import { connect, disconnect } from 'mongoose';
import { MONGO_DB_NAME, MONGO_URI } from '../utils/configs/env.config';
import logger from '../utils/log.util';

export async function connectToDatabase(): Promise<void> {
  try {
    await connect(MONGO_URI, { dbName: MONGO_DB_NAME });
    logger.info('Connected to MongoDB successfully.');
  } catch (error) {
    logger.error('Failed to connect to MongoDB.', { error });
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await disconnect();
    logger.info('Disconnected from MongoDB successfully.');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB.', { error });
    throw error;
  }
}
