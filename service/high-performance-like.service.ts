import { redisManager } from '../config/redis-optimized.config';
import { Redis } from 'ioredis';

export interface LikeData {
  postId: string;
  userId: string;
  timestamp: number;
}

export interface LikeStats {
  totalLikes: number;
  uniqueUsers: number;
  likesPerSecond: number;
  lastUpdated: number;
}

export class HighPerformanceLikeService {
  private static instance: HighPerformanceLikeService;
  private readonly LIKE_COUNTER_KEY = 'likes:count:';
  private readonly LIKE_SET_KEY = 'likes:users:';
  private readonly LIKE_QUEUE_KEY = 'likes:queue';
  private readonly LIKE_STATS_KEY = 'likes:stats:';
  private readonly RATE_LIMIT_KEY = 'likes:ratelimit:';
  
  // Configuration
  private readonly BATCH_SIZE = 100;
  private readonly SYNC_INTERVAL = 1000; // 1 second
  private readonly RATE_LIMIT_WINDOW = 60; // 1 minute
  private readonly MAX_LIKES_PER_USER = 10; // per minute

  private constructor() {}

  public static getInstance(): HighPerformanceLikeService {
    if (!HighPerformanceLikeService.instance) {
      HighPerformanceLikeService.instance = new HighPerformanceLikeService();
    }
    return HighPerformanceLikeService.instance;
  }

  /**
   * Add a like with atomic operations and rate limiting
   */
  public async addLike(postId: string, userId: string): Promise<{
    success: boolean;
    message: string;
    stats?: LikeStats;
  }> {
    try {
      const client = redisManager.getPoolClient();
      
      // Check rate limit first
      const rateLimitResult = await this.checkRateLimit(userId);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          message: `Rate limit exceeded. Try again in ${rateLimitResult.resetTime} seconds.`
        };
      }

      // Use Redis transaction for atomic operations
      const multi = client.multi();
      
      const likeCountKey = `${this.LIKE_COUNTER_KEY}${postId}`;
      const likeSetKey = `${this.LIKE_SET_KEY}${postId}`;
      const statsKey = `${this.LIKE_STATS_KEY}${postId}`;
      const queueKey = this.LIKE_QUEUE_KEY;

      // Check if user already liked this post
      const alreadyLiked = await client.sismember(likeSetKey, userId);
      if (alreadyLiked) {
        return {
          success: false,
          message: 'Post already liked by this user'
        };
      }

      // Atomic operations
      multi.incr(likeCountKey); // Increment like counter
      multi.sadd(likeSetKey, userId); // Add user to set (prevents duplicates)
      multi.expire(likeCountKey, 3600); // Set TTL for cleanup
      multi.expire(likeSetKey, 3600);
      
      // Add to processing queue for database sync
      const likeData: LikeData = {
        postId,
        userId,
        timestamp: Date.now()
      };
      multi.lpush(queueKey, JSON.stringify(likeData));
      
      // Update stats
      const currentTime = Date.now();
      multi.hset(statsKey, {
        'lastUpdated': currentTime,
        'lastLikeTime': currentTime
      });
      multi.expire(statsKey, 3600);

      // Execute all operations atomically
      const results = await multi.exec();
      
      if (!results || results.some(([err]) => err)) {
        throw new Error('Redis transaction failed');
      }

      // Get updated stats
      const stats = await this.getLikeStats(postId);
      
      console.log(`✅ Like added - Post: ${postId}, User: ${userId}, Total: ${stats.totalLikes}`);
      
      return {
        success: true,
        message: 'Like added successfully',
        stats
      };

    } catch (error) {
      console.error('❌ Error adding like:', error);
      return {
        success: false,
        message: 'Failed to add like. Please try again.'
      };
    }
  }

  /**
   * Remove a like with atomic operations
   */
  public async removeLike(postId: string, userId: string): Promise<{
    success: boolean;
    message: string;
    stats?: LikeStats;
  }> {
    try {
      const client = redisManager.getPoolClient();
      
      const likeCountKey = `${this.LIKE_COUNTER_KEY}${postId}`;
      const likeSetKey = `${this.LIKE_SET_KEY}${postId}`;
      const statsKey = `${this.LIKE_STATS_KEY}${postId}`;

      // Check if user actually liked this post
      const hasLiked = await client.sismember(likeSetKey, userId);
      if (!hasLiked) {
        return {
          success: false,
          message: 'Post not liked by this user'
        };
      }

      // Atomic operations
      const multi = client.multi();
      multi.decr(likeCountKey); // Decrement like counter
      multi.srem(likeSetKey, userId); // Remove user from set
      
      // Update stats
      multi.hset(statsKey, 'lastUpdated', Date.now());

      const results = await multi.exec();
      
      if (!results || results.some(([err]) => err)) {
        throw new Error('Redis transaction failed');
      }

      // Get updated stats
      const stats = await this.getLikeStats(postId);
      
      console.log(`✅ Like removed - Post: ${postId}, User: ${userId}, Total: ${stats.totalLikes}`);
      
      return {
        success: true,
        message: 'Like removed successfully',
        stats
      };

    } catch (error) {
      console.error('❌ Error removing like:', error);
      return {
        success: false,
        message: 'Failed to remove like. Please try again.'
      };
    }
  }

  /**
   * Get comprehensive like statistics
   */
  public async getLikeStats(postId: string): Promise<LikeStats> {
    try {
      const client = redisManager.getMainClient();
      
      const likeCountKey = `${this.LIKE_COUNTER_KEY}${postId}`;
      const likeSetKey = `${this.LIKE_SET_KEY}${postId}`;
      const statsKey = `${this.LIKE_STATS_KEY}${postId}`;

      // Get all stats in parallel
      const [totalLikes, uniqueUsers, statsData] = await Promise.all([
        client.get(likeCountKey).then(val => parseInt(val || '0')),
        client.scard(likeSetKey),
        client.hgetall(statsKey)
      ]);

      // Calculate likes per second
      const lastUpdated = parseInt(statsData.lastUpdated || '0');
      const lastLikeTime = parseInt(statsData.lastLikeTime || '0');
      const timeDiff = Math.max(1, (Date.now() - lastLikeTime) / 1000);
      const likesPerSecond = Math.round((totalLikes / timeDiff) * 100) / 100;

      return {
        totalLikes,
        uniqueUsers,
        likesPerSecond,
        lastUpdated: lastUpdated || Date.now()
      };

    } catch (error) {
      console.error('❌ Error getting like stats:', error);
      return {
        totalLikes: 0,
        uniqueUsers: 0,
        likesPerSecond: 0,
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * Check if user has already liked a post
   */
  public async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    try {
      const client = redisManager.getMainClient();
      const likeSetKey = `${this.LIKE_SET_KEY}${postId}`;
      return await client.sismember(likeSetKey, userId) === 1;
    } catch (error) {
      console.error('❌ Error checking user like:', error);
      return false;
    }
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const client = redisManager.getMainClient();
      const rateLimitKey = `${this.RATE_LIMIT_KEY}${userId}`;
      
      const current = await client.get(rateLimitKey);
      const currentCount = parseInt(current || '0');
      
      if (currentCount >= this.MAX_LIKES_PER_USER) {
        const ttl = await client.ttl(rateLimitKey);
        return {
          allowed: false,
          remaining: 0,
          resetTime: ttl
        };
      }

      // Increment counter and set expiry if it's the first request
      const multi = client.multi();
      multi.incr(rateLimitKey);
      if (!current) {
        multi.expire(rateLimitKey, this.RATE_LIMIT_WINDOW);
      }
      await multi.exec();

      return {
        allowed: true,
        remaining: this.MAX_LIKES_PER_USER - currentCount - 1,
        resetTime: this.RATE_LIMIT_WINDOW
      };

    } catch (error) {
      console.error('❌ Rate limit check error:', error);
      return { allowed: true, remaining: 0, resetTime: 0 }; // Allow on error
    }
  }

  /**
   * Bulk get statistics for multiple posts
   */
  public async getBulkStats(postIds: string[]): Promise<Record<string, LikeStats>> {
    try {
      const results = await Promise.all(
        postIds.map(async (postId) => {
          const stats = await this.getLikeStats(postId);
          return { postId, stats };
        })
      );

      return results.reduce((acc, { postId, stats }) => {
        acc[postId] = stats;
        return acc;
      }, {} as Record<string, LikeStats>);

    } catch (error) {
      console.error('❌ Error getting bulk stats:', error);
      return {};
    }
  }

  /**
   * Get processing queue length for monitoring
   */
  public async getQueueLength(): Promise<number> {
    try {
      const client = redisManager.getMainClient();
      return await client.llen(this.LIKE_QUEUE_KEY);
    } catch (error) {
      console.error('❌ Error getting queue length:', error);
      return 0;
    }
  }

  /**
   * Process likes queue for database synchronization
   */
  public async processLikesQueue(batchSize: number = this.BATCH_SIZE): Promise<LikeData[]> {
    try {
      const client = redisManager.getMainClient();
      const queueKey = this.LIKE_QUEUE_KEY;
      
      // Get batch of items from queue
      const items = await client.lrange(queueKey, 0, batchSize - 1);
      
      if (items.length === 0) {
        return [];
      }

      // Remove processed items from queue
      await client.ltrim(queueKey, items.length, -1);
      
      // Parse items
      const likeDataArray = items.map(item => {
        try {
          return JSON.parse(item) as LikeData;
        } catch (error) {
          console.error('❌ Error parsing queue item:', error);
          return null;
        }
      }).filter(Boolean) as LikeData[];

      console.log(`✅ Processed ${likeDataArray.length} likes from queue`);
      return likeDataArray;

    } catch (error) {
      console.error('❌ Error processing likes queue:', error);
      return [];
    }
  }

  /**
   * Health check for the like service
   */
  public async healthCheck(): Promise<{
    status: string;
    queueLength: number;
    connectionStatus: object;
    timestamp: number;
  }> {
    try {
      const queueLength = await this.getQueueLength();
      const connectionStatus = redisManager.getConnectionStatus();
      
      return {
        status: 'healthy',
        queueLength,
        connectionStatus,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        queueLength: -1,
        connectionStatus: {},
        timestamp: Date.now()
      };
    }
  }
}

// Export singleton instance
export const likeService = HighPerformanceLikeService.getInstance();
