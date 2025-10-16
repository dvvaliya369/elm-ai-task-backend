import { Request, Response } from 'express';
import redisHealthService from '../service/redis-health.service';
import cacheService from '../service/cache.service';

export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  timestamp: string;
  services: {
    redis: any;
  };
  version?: string;
}

export interface RedisTestResponse {
  success: boolean;
  operations: Record<string, boolean>;
  error?: string;
  timestamp: string;
}

class HealthController {
  /**
   * General health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const redisHealth = await redisHealthService.healthCheck();
      const metrics = await redisHealthService.getMetrics();

      const overallStatus = redisHealth.status;
      
      const healthResponse: HealthResponse = {
        status: overallStatus,
        message: overallStatus === 'healthy' ? 'All services operational' : 'Some services are down',
        timestamp: new Date().toISOString(),
        services: {
          redis: {
            ...redisHealth,
            metrics,
          },
        },
        version: process.env.npm_package_version || '1.0.0',
      };

      const statusCode = overallStatus === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthResponse);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Redis-specific health check
   */
  async redisHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await redisHealthService.healthCheck();
      const metrics = await redisHealthService.getMetrics();
      const connectionInfo = await redisHealthService.getConnectionInfo();

      const response = {
        ...health,
        metrics,
        connectionInfo,
      };

      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        message: 'Redis health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test Redis operations
   */
  async testRedis(req: Request, res: Response): Promise<void> {
    try {
      const operationTest = await redisHealthService.testOperations();
      
      const response: RedisTestResponse = {
        ...operationTest,
        timestamp: new Date().toISOString(),
      };

      const statusCode = operationTest.success ? 200 : 500;
      res.status(statusCode).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        operations: {
          set: false,
          get: false,
          delete: false,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get Redis metrics
   */
  async redisMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await redisHealthService.getMetrics();
      
      if (!metrics) {
        res.status(503).json({
          error: 'Unable to retrieve Redis metrics',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve Redis metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get cache statistics
   */
  async cacheStats(req: Request, res: Response): Promise<void> {
    try {
      const pattern = req.query.pattern as string || '*';
      const keys = await cacheService.getAllKeys(pattern);
      
      const keysByPrefix = keys.reduce((acc, key) => {
        const prefix = key.split(':')[0];
        acc[prefix] = (acc[prefix] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stats = {
        totalKeys: keys.length,
        keysByPrefix,
        pattern,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve cache statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Clear cache (use with caution)
   */
  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      const pattern = req.body.pattern as string;
      
      if (!pattern) {
        res.status(400).json({
          error: 'Pattern is required',
          message: 'Please provide a pattern to clear specific keys',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await cacheService.deletePattern(pattern);
      
      res.status(success ? 200 : 500).json({
        success,
        pattern,
        message: success ? `Cache cleared for pattern: ${pattern}` : 'Failed to clear cache',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Flush entire Redis database (use with extreme caution)
   */
  async flushCache(req: Request, res: Response): Promise<void> {
    try {
      // Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        res.status(403).json({
          error: 'Operation not allowed in production',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const success = await cacheService.flush();
      
      res.status(success ? 200 : 500).json({
        success,
        message: success ? 'Cache flushed successfully' : 'Failed to flush cache',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to flush cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new HealthController();
