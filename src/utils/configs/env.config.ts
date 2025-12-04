import { config } from 'dotenv';
import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_ENV,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_JWT_SECRET,
  DEFAULT_LOG_LEVEL,
  DEFAULT_MONGO_DB_NAME,
  DEFAULT_MONGO_URI,
  DEFAULT_PORT,
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
} from '../consts/static.const';

// Load environment variables
config({ debug: false, quiet: true, override: false });

// Export configuration
export const PORT: number = parseInt(process.env.PORT || DEFAULT_PORT, 10);
export const NODE_ENV: string = process.env.NODE_ENV || DEFAULT_ENV;
export const LOG_LEVEL: string = process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL;
export const CORS_ORIGIN: string = process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN;
export const JWT_SECRET: string = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
export const MONGO_URI: string = process.env.MONGO_URI || DEFAULT_MONGO_URI;
export const MONGO_DB_NAME: string = process.env.MONGO_DB_NAME || DEFAULT_MONGO_DB_NAME;
export const REDIS: Record<string, unknown> = {
  host: process.env.REDIS_HOST || DEFAULT_REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || DEFAULT_REDIS_PORT, 10),
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
};
