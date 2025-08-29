import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis';

export const healthCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const health = {
      service: 'auth-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check MongoDB connection
    try {
      if (mongoose.connection.readyState === 1) {
        health.checks.database = 'connected';
      } else {
        health.checks.database = 'disconnected';
        health.status = 'unhealthy';
      }
    } catch (error) {
      health.checks.database = 'error';
      health.status = 'unhealthy';
    }

    // Check Redis connection
    try {
      const redisClient = getRedisClient();
      await redisClient.ping();
      health.checks.redis = 'connected';
    } catch (error) {
      health.checks.redis = 'error';
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      service: 'auth-service',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
};
