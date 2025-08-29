import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;
let isConnected = false;

const REDIS_URL = process.env['REDIS_URL'] || 'redis://localhost:6379';

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 10000,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis Client Reconnecting...');
    });

    await redisClient.connect();
    logger.info('Redis connected successfully');
    isConnected = true;
  } catch (error) {
    logger.error('Redis connection error:', error);
    isConnected = false;
    // Don't exit process, just log the error
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient || !isConnected) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && isConnected) {
    await redisClient.disconnect();
    isConnected = false;
    logger.info('Redis disconnected');
  }
};

// Safe Redis operations that work without Redis
export const setKey = async (key: string, value: string, ttl?: number): Promise<void> => {
  if (!isConnected) {
    logger.warn(`Redis not connected, skipping setKey: ${key}`);
    return;
  }
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error('Redis setKey error:', error);
  }
};

export const getKey = async (key: string): Promise<string | null> => {
  if (!isConnected) {
    logger.warn(`Redis not connected, skipping getKey: ${key}`);
    return null;
  }
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Redis getKey error:', error);
    return null;
  }
};

export const deleteKey = async (key: string): Promise<void> => {
  if (!isConnected) {
    logger.warn(`Redis not connected, skipping deleteKey: ${key}`);
    return;
  }
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis deleteKey error:', error);
  }
};

export const keyExists = async (key: string): Promise<boolean> => {
  if (!isConnected) {
    logger.warn(`Redis not connected, skipping keyExists: ${key}`);
    return false;
  }
  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Redis keyExists error:', error);
    return false;
  }
};
