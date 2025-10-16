import { createClient } from "redis";
import envConfig from "./env.config";

type RedisClient = ReturnType<typeof createClient>;

class RedisClientManager {
  private client: RedisClient | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;

  private getRedisConfig() {
    const config: Parameters<typeof createClient>[0] = {};

    if (envConfig.REDIS_URL) {
      // Use connection URL if provided (for cloud/managed Redis)
      config.url = envConfig.REDIS_URL;
    } else {
      // Use individual connection parameters
      config.socket = {
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
      };
      
      if (envConfig.REDIS_PASSWORD) {
        config.password = envConfig.REDIS_PASSWORD;
      }
      
      if (envConfig.REDIS_DB) {
        config.database = envConfig.REDIS_DB;
      }
    }

    return config;
  }

  private createClient(): RedisClient {
    const config = this.getRedisConfig();
    const client = createClient(config);

    // Event handlers
    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    client.on("connect", () => {
      console.info("Redis: Connection established");
    });

    client.on("ready", () => {
      console.info("Redis: Client ready to use");
    });

    client.on("end", () => {
      console.info("Redis: Connection closed");
    });

    client.on("reconnecting", () => {
      console.info("Redis: Attempting to reconnect...");
    });

    return client;
  }

  async connect(): Promise<void> {
    if (this.client && this.client.isReady) {
      return; // Already connected
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise; // Wait for existing connection attempt
    }

    this.isConnecting = true;
    
    this.connectionPromise = (async () => {
      try {
        this.client = this.createClient();
        await this.client.connect();
        
        // Test the connection
        await this.client.ping();
        console.info("Redis: Connection successful and verified");
        
      } catch (error) {
        console.error("Redis: Failed to connect", error);
        this.client = null;
        throw error;
      } finally {
        this.isConnecting = false;
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        console.info("Redis: Gracefully disconnected");
      } catch (error) {
        console.error("Redis: Error during disconnection", error);
      } finally {
        this.client = null;
      }
    }
  }

  getClient(): RedisClient {
    if (!this.client || !this.client.isReady) {
      throw new Error("Redis client is not connected. Call connect() first.");
    }
    return this.client;
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      const isConnected = await this.isConnected();
      
      if (!isConnected) {
        return {
          status: "unhealthy",
          message: "Redis connection failed",
          timestamp: new Date().toISOString(),
        };
      }

      const info = await this.client!.info("server");
      const redisVersion = info.split("\n").find(line => line.startsWith("redis_version:"))?.split(":")[1]?.trim();

      return {
        status: "healthy",
        message: `Redis is connected (version: ${redisVersion || "unknown"})`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `Redis health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance
const redisManager = new RedisClientManager();

// Initialize connection
const initializeRedis = async (): Promise<void> => {
  try {
    await redisManager.connect();
  } catch (error) {
    console.error("Failed to initialize Redis connection:", error);
    // Don't exit the process - let the application handle Redis unavailability gracefully
  }
};

// Initialize on module load
initializeRedis();

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing Redis connection...");
  await redisManager.disconnect();
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing Redis connection...");
  await redisManager.disconnect();
  process.exit(0);
});

export default redisManager;
export { RedisClientManager };
