import { config } from 'dotenv';
import {
  DEFAULT_CORS_ORIGIN,
  DEFAULT_ENV,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_JWT_SECRET,
  DEFAULT_LOG_LEVEL,
  DEFAULT_MONGO_URI,
  DEFAULT_PORT,
} from '../utils/consts/static.const';

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
