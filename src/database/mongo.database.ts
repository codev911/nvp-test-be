import { connect } from 'mongoose';
import { MONGO_URI } from '../utils/configs/env.config';
import logger from '../utils/log.util';

export async function connectToDatabase(): Promise<void> {
  try {
    await connect(MONGO_URI);
    logger.info('Connected to MongoDB successfully.');
  } catch (error) {
    logger.error('Failed to connect to MongoDB.', { error });
    throw error;
  }
}
