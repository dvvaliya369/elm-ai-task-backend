import redisClient from "../config/redis.config";

class CacheService {
  private readonly DEFAULT_TTL = 3600;

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: string, data: unknown, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<boolean> {
    try {
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
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  generateProfileKey(userId: string): string {
    return `profile:${userId}`;
  }

  generateUserPattern(userId: string): string {
    return `*:${userId}*`;
  }
}

export default new CacheService();
