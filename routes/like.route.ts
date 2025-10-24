import { Router } from 'express';
import { Request, Response } from 'express';
import { likeService } from '../service/high-performance-like.service';
import { databaseSyncService } from '../service/database-sync.service';
import { redisManager } from '../config/redis-optimized.config';

const router = Router();

// Rate limiting middleware
const rateLimitMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const userId = req.body.userId || req.query.userId || req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Add userId to request for later use
    (req as any).userId = userId;
    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * POST /api/likes/:postId/like
 * Add a like to a post
 */
router.post('/:postId/like', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).userId;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const result = await likeService.addLike(postId, userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('Add like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add like'
    });
  }
});

/**
 * DELETE /api/likes/:postId/like
 * Remove a like from a post
 */
router.delete('/:postId/like', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).userId;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const result = await likeService.removeLike(postId, userId);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error) {
    console.error('Remove like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove like'
    });
  }
});

/**
 * GET /api/likes/:postId/stats
 * Get like statistics for a post
 */
router.get('/:postId/stats', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const stats = await likeService.getLikeStats(postId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get like statistics'
    });
  }
});

/**
 * POST /api/likes/bulk-stats
 * Get like statistics for multiple posts
 */
router.post('/bulk-stats', async (req: Request, res: Response) => {
  try {
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Post IDs array is required'
      });
    }

    if (postIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 posts allowed per request'
      });
    }

    const stats = await likeService.getBulkStats(postIds);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get bulk stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bulk statistics'
    });
  }
});

/**
 * GET /api/likes/:postId/check/:userId
 * Check if a user has liked a post
 */
router.get('/:postId/check/:userId', async (req: Request, res: Response) => {
  try {
    const { postId, userId } = req.params;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and User ID are required'
      });
    }

    const hasLiked = await likeService.hasUserLiked(postId, userId);

    res.json({
      success: true,
      data: {
        hasLiked,
        postId,
        userId
      }
    });

  } catch (error) {
    console.error('Check like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check like status'
    });
  }
});

/**
 * GET /api/likes/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const likeServiceHealth = await likeService.healthCheck();
    const syncServiceStatus = databaseSyncService.getStatus();
    const redisStatus = redisManager.getConnectionStatus();

    const overallHealth = {
      status: likeServiceHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: Date.now(),
      services: {
        likeService: likeServiceHealth,
        databaseSync: syncServiceStatus,
        redis: redisStatus
      }
    };

    const statusCode = overallHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(overallHealth);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: 'Health check failed'
    });
  }
});

/**
 * POST /api/likes/admin/sync
 * Trigger manual database synchronization (admin only)
 */
router.post('/admin/sync', async (req: Request, res: Response) => {
  try {
    // In a real application, add admin authentication middleware here
    
    await databaseSyncService.triggerSync();

    res.json({
      success: true,
      message: 'Manual sync triggered successfully'
    });

  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger manual sync'
    });
  }
});

/**
 * GET /api/likes/admin/queue-status
 * Get queue status and metrics (admin only)
 */
router.get('/admin/queue-status', async (req: Request, res: Response) => {
  try {
    // In a real application, add admin authentication middleware here
    
    const queueLength = await likeService.getQueueLength();
    const syncStatus = databaseSyncService.getStatus();

    res.json({
      success: true,
      data: {
        queueLength,
        syncService: syncStatus,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status'
    });
  }
});

/**
 * POST /api/likes/:postId/toggle
 * Toggle like status (add if not liked, remove if liked)
 */
router.post('/:postId/toggle', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).userId;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    // Check current status
    const hasLiked = await likeService.hasUserLiked(postId, userId);
    
    let result;
    if (hasLiked) {
      result = await likeService.removeLike(postId, userId);
    } else {
      result = await likeService.addLike(postId, userId);
    }

    res.json({
      ...result,
      action: hasLiked ? 'removed' : 'added'
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
});

export default router;
