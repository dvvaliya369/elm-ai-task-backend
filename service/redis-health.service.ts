import redisManager from "../config/redis.config";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded";
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface RedisMetrics {
  connectedClients: number;
  usedMemory: number;
  usedMemoryHuman: string;
  totalCommandsProcessed: number;
  instantaneousOpsPerSec: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  hitRatio: number;
}

class RedisHealthService {
  /**
   * Perform a comprehensive health check of Redis
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const isConnected = await redisManager.isConnected();
      
      if (!isConnected) {
        return {
          status: "unhealthy",
          message: "Redis connection failed",
          timestamp: new Date().toISOString(),
        };
      }

      // Get detailed Redis information
      const client = redisManager.getClient();
      const info = await client.info();
      const dbSize = await client.dbSize();
      const memoryInfo = await client.info("memory");
      
      // Parse Redis version
      const serverInfo = await client.info("server");
      const redisVersion = serverInfo
        .split("\n")
        .find(line => line.startsWith("redis_version:"))
        ?.split(":")[1]
        ?.trim();

      const details = {
        version: redisVersion,
        dbSize,
        connectionInfo: this.parseConnectionInfo(info),
        memoryInfo: this.parseMemoryInfo(memoryInfo),
      };

      return {
        status: "healthy",
        message: "Redis is operational",
        timestamp: new Date().toISOString(),
        details,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `Redis health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get Redis performance metrics
   */
  async getMetrics(): Promise<RedisMetrics | null> {
    try {
      if (!await redisManager.isConnected()) {
        return null;
      }

      const client = redisManager.getClient();
      const info = await client.info("stats");
      const memory = await client.info("memory");
      const clients = await client.info("clients");

      return this.parseMetrics(info, memory, clients);
    } catch (error) {
      console.error("Failed to get Redis metrics:", error);
      return null;
    }
  }

  /**
   * Test Redis operations (read/write/delete)
   */
  async testOperations(): Promise<{ success: boolean; operations: Record<string, boolean>; error?: string }> {
    const testKey = `health_check_${Date.now()}`;
    const testValue = { test: true, timestamp: Date.now() };
    
    const operations = {
      set: false,
      get: false,
      delete: false,
    };

    try {
      if (!await redisManager.isConnected()) {
        throw new Error("Redis not connected");
      }

      const client = redisManager.getClient();

      // Test SET operation
      await client.setEx(testKey, 60, JSON.stringify(testValue));
      operations.set = true;

      // Test GET operation
      const retrieved = await client.get(testKey);
      const parsedValue = retrieved ? JSON.parse(retrieved) : null;
      operations.get = parsedValue?.test === testValue.test;

      // Test DELETE operation
      await client.del(testKey);
      const deleted = await client.get(testKey);
      operations.delete = deleted === null;

      const success = Object.values(operations).every(op => op === true);
      
      return {
        success,
        operations,
      };
    } catch (error) {
      // Clean up test key if it exists
      try {
        const client = redisManager.getClient();
        await client.del(testKey);
      } catch {
        // Ignore cleanup errors
      }

      return {
        success: false,
        operations,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get Redis connection information
   */
  async getConnectionInfo(): Promise<Record<string, any> | null> {
    try {
      if (!await redisManager.isConnected()) {
        return null;
      }

      const client = redisManager.getClient();
      const info = await client.info("clients");
      
      return this.parseConnectionInfo(info);
    } catch (error) {
      console.error("Failed to get Redis connection info:", error);
      return null;
    }
  }

  private parseConnectionInfo(info: string): Record<string, any> {
    const lines = info.split("\n");
    const connectionInfo: Record<string, any> = {};

    for (const line of lines) {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        const cleanKey = key.trim();
        const cleanValue = value.trim();

        if (cleanKey === "connected_clients" || 
            cleanKey === "blocked_clients" ||
            cleanKey === "tracking_clients") {
          connectionInfo[cleanKey] = parseInt(cleanValue, 10);
        }
      }
    }

    return connectionInfo;
  }

  private parseMemoryInfo(memoryInfo: string): Record<string, any> {
    const lines = memoryInfo.split("\n");
    const memory: Record<string, any> = {};

    for (const line of lines) {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        const cleanKey = key.trim();
        const cleanValue = value.trim();

        if (cleanKey === "used_memory" ||
            cleanKey === "used_memory_rss" ||
            cleanKey === "used_memory_peak") {
          memory[cleanKey] = parseInt(cleanValue, 10);
        } else if (cleanKey === "used_memory_human" ||
                  cleanKey === "used_memory_rss_human" ||
                  cleanKey === "used_memory_peak_human") {
          memory[cleanKey] = cleanValue;
        }
      }
    }

    return memory;
  }

  private parseMetrics(statsInfo: string, memoryInfo: string, clientsInfo: string): RedisMetrics {
    const parseValue = (info: string, key: string): number => {
      const line = info.split("\n").find(l => l.startsWith(key + ":"));
      return line ? parseInt(line.split(":")[1].trim(), 10) : 0;
    };

    const parseStringValue = (info: string, key: string): string => {
      const line = info.split("\n").find(l => l.startsWith(key + ":"));
      return line ? line.split(":")[1].trim() : "";
    };

    const keyspaceHits = parseValue(statsInfo, "keyspace_hits");
    const keyspaceMisses = parseValue(statsInfo, "keyspace_misses");
    const totalRequests = keyspaceHits + keyspaceMisses;
    const hitRatio = totalRequests > 0 ? (keyspaceHits / totalRequests) * 100 : 0;

    return {
      connectedClients: parseValue(clientsInfo, "connected_clients"),
      usedMemory: parseValue(memoryInfo, "used_memory"),
      usedMemoryHuman: parseStringValue(memoryInfo, "used_memory_human"),
      totalCommandsProcessed: parseValue(statsInfo, "total_commands_processed"),
      instantaneousOpsPerSec: parseValue(statsInfo, "instantaneous_ops_per_sec"),
      keyspaceHits,
      keyspaceMisses,
      hitRatio: Math.round(hitRatio * 100) / 100,
    };
  }
}

export default new RedisHealthService();
export { RedisMetrics, HealthStatus };
