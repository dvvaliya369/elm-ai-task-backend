import Redis, { RedisOptions } from 'ioredis';
import { EventEmitter } from 'events';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  maxmemoryPolicy: string;
  lazyConnect: boolean;
  keepAlive: number;
  connectTimeout: number;
  commandTimeout: number;
  family: number;
}

export class RedisConnectionManager extends EventEmitter {
  private static instance: RedisConnectionManager;
  private redisClient: Redis | null = null;
  private publisherClient: Redis | null = null;
  private subscriberClient: Redis | null = null;
  private connectionPool: Redis[] = [];
  private readonly poolSize: number = 10;

  private constructor() {
    super();
    this.setMaxListeners(0); // Remove listener limit
  }

  public static getInstance(): RedisConnectionManager {
    if (!RedisConnectionManager.instance) {
      RedisConnectionManager.instance = new RedisConnectionManager();
    }
    return RedisConnectionManager.instance;
  }

  private getRedisConfig(): RedisOptions {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      
      // Connection pool settings
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      family: 4,
      
      // Performance settings
      enableReadyCheck: true,
      enableOfflineQueue: false,
    };
  }

  public async connect(): Promise<void> {
    try {
      const config = this.getRedisConfig();
      
      // Main client for general operations
      this.redisClient = new Redis(config);
      
      // Dedicated publisher client
      this.publisherClient = new Redis(config);
      
      // Dedicated subscriber client  
      this.subscriberClient = new Redis(config);

      // Create connection pool for high concurrency
      for (let i = 0; i < this.poolSize; i++) {
        const poolClient = new Redis(config);
        this.connectionPool.push(poolClient);
      }

      // Set up event handlers
      this.setupEventHandlers();

      // Connect all clients
      await Promise.all([
        this.redisClient.connect(),
        this.publisherClient.connect(),
        this.subscriberClient.connect(),
        ...this.connectionPool.map(client => client.connect())
      ]);

      // Verify connections
      await this.redisClient.ping();
      await this.publisherClient.ping();
      await this.subscriberClient.ping();

      console.info('✅ Redis connection pool established successfully');
      console.info(`📊 Pool size: ${this.poolSize} connections`);
      
      this.emit('connected');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    const clients = [
      this.redisClient,
      this.publisherClient,
      this.subscriberClient,
      ...this.connectionPool
    ].filter(Boolean);

    clients.forEach((client, index) => {
      client!.on('error', (err) => {
        console.error(`Redis client ${index} error:`, err);
        this.emit('error', err);
      });

      client!.on('ready', () => {
        console.info(`Redis client ${index} ready`);
      });

      client!.on('reconnecting', () => {
        console.info(`Redis client ${index} reconnecting...`);
      });
    });
  }

  public getMainClient(): Redis {
    if (!this.redisClient || this.redisClient.status !== 'ready') {
      throw new Error('Redis main client is not connected');
    }
    return this.redisClient;
  }

  public getPublisher(): Redis {
    if (!this.publisherClient || this.publisherClient.status !== 'ready') {
      throw new Error('Redis publisher client is not connected');
    }
    return this.publisherClient;
  }

  public getSubscriber(): Redis {
    if (!this.subscriberClient || this.subscriberClient.status !== 'ready') {
      throw new Error('Redis subscriber client is not connected');
    }
    return this.subscriberClient;
  }

  public getPoolClient(): Redis {
    const availableClients = this.connectionPool.filter(
      client => client.status === 'ready'
    );
    
    if (availableClients.length === 0) {
      throw new Error('No available Redis pool clients');
    }
    
    // Simple round-robin selection
    const randomIndex = Math.floor(Math.random() * availableClients.length);
    return availableClients[randomIndex];
  }

  public async closeConnections(): Promise<void> {
    try {
      const clients = [
        this.redisClient,
        this.publisherClient,
        this.subscriberClient,
        ...this.connectionPool
      ].filter(Boolean);

      await Promise.all(clients.map(client => client!.quit()));
      
      this.redisClient = null;
      this.publisherClient = null;
      this.subscriberClient = null;
      this.connectionPool = [];
      
      console.info('✅ All Redis connections closed');
      this.emit('disconnected');
    } catch (error) {
      console.error('❌ Error closing Redis connections:', error);
      throw error;
    }
  }

  public getConnectionStatus(): object {
    return {
      main: this.redisClient?.status || 'disconnected',
      publisher: this.publisherClient?.status || 'disconnected',
      subscriber: this.subscriberClient?.status || 'disconnected',
      poolSize: this.connectionPool.length,
      poolStatus: this.connectionPool.map(client => client.status)
    };
  }
}

// Export singleton instance
export const redisManager = RedisConnectionManager.getInstance();

// Initialize connection on module load
(async () => {
  try {
    await redisManager.connect();
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    process.exit(1);
  }
})();

export default redisManager;
