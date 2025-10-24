import { Worker } from 'bullmq';
import { redisManager } from '../config/redis-optimized.config';
import { likeService, LikeData } from './high-performance-like.service';

// Assuming you have a database service/model for posts
interface DatabaseService {
  updateLikeCount(postId: string, count: number): Promise<void>;
  addLikeRecord(postId: string, userId: string, timestamp: number): Promise<void>;
  removeLikeRecord(postId: string, userId: string): Promise<void>;
}

export class DatabaseSyncService {
  private static instance: DatabaseSyncService;
  private worker: Worker | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private constructor(private databaseService?: DatabaseService) {}

  public static getInstance(databaseService?: DatabaseService): DatabaseSyncService {
    if (!DatabaseSyncService.instance) {
      DatabaseSyncService.instance = new DatabaseSyncService(databaseService);
    }
    return DatabaseSyncService.instance;
  }

  /**
   * Start the database synchronization service
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('📊 Database sync service is already running');
      return;
    }

    try {
      console.log('🚀 Starting database sync service...');

      // Start periodic sync
      this.startPeriodicSync();

      // Start queue worker for real-time processing
      await this.startQueueWorker();

      this.isRunning = true;
      console.log('✅ Database sync service started successfully');

    } catch (error) {
      console.error('❌ Failed to start database sync service:', error);
      throw error;
    }
  }

  /**
   * Stop the database synchronization service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('📊 Database sync service is not running');
      return;
    }

    try {
      console.log('🛑 Stopping database sync service...');

      // Stop periodic sync
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      // Stop queue worker
      if (this.worker) {
        await this.worker.close();
        this.worker = null;
      }

      this.isRunning = false;
      console.log('✅ Database sync service stopped successfully');

    } catch (error) {
      console.error('❌ Error stopping database sync service:', error);
      throw error;
    }
  }

  /**
   * Start periodic synchronization (every 5 seconds)
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncBatch();
      } catch (error) {
        console.error('❌ Periodic sync error:', error);
      }
    }, 5000); // Sync every 5 seconds

    console.log('⏰ Periodic sync started (every 5 seconds)');
  }

  /**
   * Start BullMQ worker for processing individual operations
   */
  private async startQueueWorker(): Promise<void> {
    const connectionConfig = {
      connection: redisManager.getMainClient()
    };

    this.worker = new Worker('database-sync', async (job) => {
      const { type, data } = job.data;

      switch (type) {
        case 'sync_batch':
          return await this.syncBatch();
        
        case 'update_like_count':
          return await this.updatePostLikeCount(data.postId);
        
        case 'emergency_sync':
          return await this.emergencySync();
        
        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    }, connectionConfig);

    this.worker.on('completed', (job) => {
      console.log(`✅ Sync job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Sync job ${job?.id} failed:`, err);
    });

    console.log('👷 Database sync worker started');
  }

  /**
   * Synchronize a batch of likes from Redis to database
   */
  private async syncBatch(): Promise<{
    processed: number;
    errors: number;
    queueLength: number;
  }> {
    try {
      const startTime = Date.now();
      let processed = 0;
      let errors = 0;

      // Process likes queue
      const likesToSync = await likeService.processLikesQueue(100);
      
      if (likesToSync.length === 0) {
        return { processed: 0, errors: 0, queueLength: 0 };
      }

      // Group likes by post for batch updates
      const likesByPost = this.groupLikesByPost(likesToSync);

      // Process each post's likes
      for (const [postId, likes] of Object.entries(likesByPost)) {
        try {
          await this.syncPostLikes(postId, likes);
          processed += likes.length;
        } catch (error) {
          console.error(`❌ Error syncing likes for post ${postId}:`, error);
          errors += likes.length;
        }
      }

      // Update like counts from Redis
      const postIds = Object.keys(likesByPost);
      await this.updateMultipleLikeCounts(postIds);

      const queueLength = await likeService.getQueueLength();
      const duration = Date.now() - startTime;

      console.log(`🔄 Batch sync completed: ${processed} processed, ${errors} errors, ${queueLength} remaining (${duration}ms)`);

      return { processed, errors, queueLength };

    } catch (error) {
      console.error('❌ Batch sync error:', error);
      return { processed: 0, errors: 0, queueLength: -1 };
    }
  }

  /**
   * Sync likes for a specific post
   */
  private async syncPostLikes(postId: string, likes: LikeData[]): Promise<void> {
    if (!this.databaseService) {
      // If no database service provided, just log the operation
      console.log(`📝 Would sync ${likes.length} likes for post ${postId}`);
      return;
    }

    try {
      // Add individual like records
      for (const like of likes) {
        await this.databaseService.addLikeRecord(
          like.postId,
          like.userId,
          like.timestamp
        );
      }

      console.log(`✅ Synced ${likes.length} likes for post ${postId}`);

    } catch (error) {
      console.error(`❌ Database sync error for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Update like count for a specific post
   */
  private async updatePostLikeCount(postId: string): Promise<void> {
    if (!this.databaseService) {
      return;
    }

    try {
      const stats = await likeService.getLikeStats(postId);
      await this.databaseService.updateLikeCount(postId, stats.totalLikes);
      
      console.log(`✅ Updated like count for post ${postId}: ${stats.totalLikes}`);

    } catch (error) {
      console.error(`❌ Error updating like count for post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Update like counts for multiple posts
   */
  private async updateMultipleLikeCounts(postIds: string[]): Promise<void> {
    if (!this.databaseService) {
      return;
    }

    try {
      const bulkStats = await likeService.getBulkStats(postIds);
      
      await Promise.all(
        Object.entries(bulkStats).map(async ([postId, stats]) => {
          try {
            await this.databaseService!.updateLikeCount(postId, stats.totalLikes);
          } catch (error) {
            console.error(`❌ Error updating count for post ${postId}:`, error);
          }
        })
      );

      console.log(`✅ Updated like counts for ${postIds.length} posts`);

    } catch (error) {
      console.error('❌ Error updating multiple like counts:', error);
      throw error;
    }
  }

  /**
   * Emergency sync - process all pending likes immediately
   */
  private async emergencySync(): Promise<void> {
    try {
      console.log('🚨 Starting emergency sync...');
      
      let totalProcessed = 0;
      let queueLength = await likeService.getQueueLength();
      
      while (queueLength > 0) {
        const result = await this.syncBatch();
        totalProcessed += result.processed;
        queueLength = result.queueLength;
        
        if (result.processed === 0) {
          break; // Prevent infinite loop
        }
      }
      
      console.log(`🚨 Emergency sync completed: ${totalProcessed} likes processed`);

    } catch (error) {
      console.error('❌ Emergency sync error:', error);
      throw error;
    }
  }

  /**
   * Group likes by post ID for efficient batch processing
   */
  private groupLikesByPost(likes: LikeData[]): Record<string, LikeData[]> {
    return likes.reduce((groups, like) => {
      if (!groups[like.postId]) {
        groups[like.postId] = [];
      }
      groups[like.postId].push(like);
      return groups;
    }, {} as Record<string, LikeData[]>);
  }

  /**
   * Get service status and metrics
   */
  public getStatus(): {
    isRunning: boolean;
    hasWorker: boolean;
    hasPeriodicSync: boolean;
  } {
    return {
      isRunning: this.isRunning,
      hasWorker: !!this.worker,
      hasPeriodicSync: !!this.syncInterval
    };
  }

  /**
   * Trigger manual sync
   */
  public async triggerSync(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Database sync service is not running');
    }
    
    await this.syncBatch();
  }
}

// Export singleton instance
export const databaseSyncService = DatabaseSyncService.getInstance();

// Auto-start the service when module is imported
(async () => {
  try {
    await databaseSyncService.start();
  } catch (error) {
    console.error('Failed to start database sync service:', error);
  }
})();
