import { Router } from 'express';
import healthController from '../controllers/health.controller';

const healthRouter = Router();

/**
 * @route GET /health
 * @description General health check endpoint
 * @access Public
 */
healthRouter.get('/', healthController.healthCheck);

/**
 * @route GET /health/redis
 * @description Redis-specific health check
 * @access Public
 */
healthRouter.get('/redis', healthController.redisHealth);

/**
 * @route GET /health/redis/test
 * @description Test Redis operations (set/get/delete)
 * @access Public
 */
healthRouter.get('/redis/test', healthController.testRedis);

/**
 * @route GET /health/redis/metrics
 * @description Get Redis performance metrics
 * @access Public
 */
healthRouter.get('/redis/metrics', healthController.redisMetrics);

/**
 * @route GET /health/cache/stats
 * @description Get cache statistics
 * @query pattern - Optional key pattern filter (default: *)
 * @access Public
 */
healthRouter.get('/cache/stats', healthController.cacheStats);

/**
 * @route POST /health/cache/clear
 * @description Clear cache keys matching pattern
 * @body pattern - Required key pattern to clear
 * @access Private (should be protected in production)
 */
healthRouter.post('/cache/clear', healthController.clearCache);

/**
 * @route POST /health/cache/flush
 * @description Flush entire cache (development only)
 * @access Private (should be protected in production)
 */
healthRouter.post('/cache/flush', healthController.flushCache);

export default healthRouter;
