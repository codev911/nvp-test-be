import redis from 'ioredis';
import { REDIS } from '../utils/configs/env.config';

export const redisClient = new redis({
  ...REDIS,
  maxRetriesPerRequest: null,
});
