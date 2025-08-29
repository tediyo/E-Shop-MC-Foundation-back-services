import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
      },
    });

    // Handle Redis events
    redisClient.on('error', (error) => {
      logger.error('Redis Client Error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis Client Connection Ended');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting...');
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');

  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await disconnectRedis();
    process.exit(0);
  } catch (error) {
    logger.error('Error during Redis connection closure:', error);
    process.exit(1);
  }
});

// Utility functions for common Redis operations
export const setKey = async (key: string, value: string, expireSeconds?: number): Promise<void> => {
  try {
    const client = getRedisClient();
    if (expireSeconds) {
      await client.setEx(key, expireSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    logger.error('Error setting Redis key:', error);
    throw error;
  }
};

export const getKey = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch (error) {
    logger.error('Error getting Redis key:', error);
    throw error;
  }
};

export const deleteKey = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error('Error deleting Redis key:', error);
    throw error;
  }
};

export const keyExists = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Error checking Redis key existence:', error);
    throw error;
  }
};
