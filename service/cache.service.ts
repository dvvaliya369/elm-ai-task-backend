import redisManager from "../config/redis.config";

class CacheService {
  private readonly DEFAULT_TTL = 3600;

  private getRedisClient() {
    try {
      return redisManager.getClient();
    } catch (error) {
      console.error("Redis client not available:", error);
      throw new Error("Redis service unavailable");
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const redisClient = this.getRedisClient();
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_TTL
  ): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error("Cache delete pattern error:", error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  async increment(key: string, increment: number = 1): Promise<number | null> {
    try {
      const redisClient = this.getRedisClient();
      const result = await redisClient.incrBy(key, increment);
      return result;
    } catch (error) {
      console.error("Cache increment error:", error);
      return null;
    }
  }

  async setWithExpiry(key: string, data: unknown, ttl: number): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Cache setWithExpiry error:", error);
      return false;
    }
  }

  async getTtl(key: string): Promise<number | null> {
    try {
      const redisClient = this.getRedisClient();
      const ttl = await redisClient.ttl(key);
      return ttl >= 0 ? ttl : null;
    } catch (error) {
      console.error("Cache getTtl error:", error);
      return null;
    }
  }

  async getAllKeys(pattern: string = "*"): Promise<string[]> {
    try {
      const redisClient = this.getRedisClient();
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error("Cache getAllKeys error:", error);
      return [];
    }
  }

  async flush(): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  }

  // Key generation methods for different data types
  generateProfileKey(userId: string): string {
    return `profile:${userId}`;
  }

  generateUserPattern(userId: string): string {
    return `*:${userId}*`;
  }

  generatePostKey(postId: string): string {
    return `post:${postId}`;
  }

  generateUserPostsKey(userId: string): string {
    return `user_posts:${userId}`;
  }

  generatePostPattern(postId: string): string {
    return `*post*:${postId}*`;
  }

  generateUserPostsPattern(userId: string): string {
    return `user_posts:${userId}*`;
  }

  generateSessionKey(sessionId: string): string {
    return `session:${sessionId}`;
  }

  generateRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }

  generateAuthTokenKey(tokenId: string): string {
    return `auth_token:${tokenId}`;
  }

  generateTempKey(identifier: string): string {
    return `temp:${identifier}`;
  }
}

export default new CacheService();
