import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error: Error) => {
  console.error('Redis connection error:', error);
});

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
