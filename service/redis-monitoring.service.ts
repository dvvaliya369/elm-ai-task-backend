import { redisManager } from '../config/redis-optimized.config';

export class RedisMonitoringService {
  private static instance: RedisMonitoringService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsHistory: any[] = [];
  private readonly maxHistorySize = 100;

  private constructor() {}

  public static getInstance(): RedisMonitoringService {
    if (!RedisMonitoringService.instance) {
      RedisMonitoringService.instance = new RedisMonitoringService();
    }
    return RedisMonitoringService.instance;
  }

  /**
   * Start monitoring Redis performance
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log('📊 Redis monitoring is already running');
      return;
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.addToHistory(metrics);
        this.checkAlerts(metrics);
      } catch (error) {
        console.error('❌ Monitoring error:', error);
      }
    }, 10000); // Collect metrics every 10 seconds

    console.log('📊 Redis monitoring started');
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('📊 Redis monitoring stopped');
    }
  }

  /**
   * Collect comprehensive Redis metrics
   */
  public async collectMetrics(): Promise<any> {
    try {
      const client = redisManager.getMainClient();
      
      // Get Redis INFO
      const infoResult = await client.info();
      const infoLines = infoResult.split('\r\n');
      const info: any = {};
      
      infoLines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          info[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });

      // Get memory usage
      // const memoryInfo = await client.memory('usage');
      
      // Get connection info
      const connectionStatus = redisManager.getConnectionStatus();

      // Calculate custom metrics
      const currentTime = Date.now();
      const metrics = {
        timestamp: currentTime,
        memory: {
          used: info.used_memory || 0,
          peak: info.used_memory_peak || 0,
          rss: info.used_memory_rss || 0,
          overhead: info.used_memory_overhead || 0,
          fragmentation_ratio: info.mem_fragmentation_ratio || 0
        },
        connections: {
          connected_clients: info.connected_clients || 0,
          blocked_clients: info.blocked_clients || 0,
          total_connections_received: info.total_connections_received || 0
        },
        operations: {
          total_commands_processed: info.total_commands_processed || 0,
          instantaneous_ops_per_sec: info.instantaneous_ops_per_sec || 0,
          keyspace_hits: info.keyspace_hits || 0,
          keyspace_misses: info.keyspace_misses || 0,
          hit_rate: this.calculateHitRate(info.keyspace_hits, info.keyspace_misses)
        },
        replication: {
          role: info.role || 'unknown',
          connected_slaves: info.connected_slaves || 0
        },
        persistence: {
          rdb_last_save_time: info.rdb_last_save_time || 0,
          rdb_changes_since_last_save: info.rdb_changes_since_last_save || 0
        },
        stats: {
          expired_keys: info.expired_keys || 0,
          evicted_keys: info.evicted_keys || 0,
          rejected_connections: info.rejected_connections || 0
        },
        connectionPool: connectionStatus
      };

      return metrics;

    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
      return {
        timestamp: Date.now(),
        error: 'Failed to collect metrics',
        connectionPool: redisManager.getConnectionStatus()
      };
    }
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? Math.round((hits / total) * 100 * 100) / 100 : 0;
  }

  /**
   * Add metrics to history
   */
  private addToHistory(metrics: any): void {
    this.metricsHistory.push(metrics);
    
    // Keep only the last N entries
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Check for alerts based on thresholds
   */
  private checkAlerts(metrics: any): void {
    const alerts = [];

    // Memory usage alert
    if (metrics.memory.fragmentation_ratio > 2.0) {
      alerts.push({
        type: 'HIGH_MEMORY_FRAGMENTATION',
        value: metrics.memory.fragmentation_ratio,
        threshold: 2.0,
        message: 'Memory fragmentation is high'
      });
    }

    // Hit rate alert
    if (metrics.operations.hit_rate < 80) {
      alerts.push({
        type: 'LOW_HIT_RATE',
        value: metrics.operations.hit_rate,
        threshold: 80,
        message: 'Cache hit rate is low'
      });
    }

    // Connections alert
    if (metrics.connections.connected_clients > 1000) {
      alerts.push({
        type: 'HIGH_CONNECTION_COUNT',
        value: metrics.connections.connected_clients,
        threshold: 1000,
        message: 'High number of connected clients'
      });
    }

    // Operations per second alert
    if (metrics.operations.instantaneous_ops_per_sec > 10000) {
      alerts.push({
        type: 'HIGH_OPS_RATE',
        value: metrics.operations.instantaneous_ops_per_sec,
        threshold: 10000,
        message: 'High operations per second rate'
      });
    }

    // Log alerts
    if (alerts.length > 0) {
      console.warn('🚨 Redis Alerts:', alerts);
    }
  }

  /**
   * Get current metrics
   */
  public async getCurrentMetrics(): Promise<any> {
    return await this.collectMetrics();
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(): any[] {
    return [...this.metricsHistory];
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): any {
    if (this.metricsHistory.length === 0) {
      return { message: 'No metrics available' };
    }

    const latest = this.metricsHistory[this.metricsHistory.length - 1];
    const history = this.metricsHistory.slice(-10); // Last 10 entries

    // Calculate averages
    const avgOpsPerSec = history.reduce((sum, m) => 
      sum + (m.operations?.instantaneous_ops_per_sec || 0), 0) / history.length;
    
    const avgHitRate = history.reduce((sum, m) => 
      sum + (m.operations?.hit_rate || 0), 0) / history.length;

    const avgMemoryUsage = history.reduce((sum, m) => 
      sum + (m.memory?.used || 0), 0) / history.length;

    return {
      timestamp: latest.timestamp,
      current: {
        opsPerSecond: latest.operations?.instantaneous_ops_per_sec || 0,
        hitRate: latest.operations?.hit_rate || 0,
        memoryUsage: latest.memory?.used || 0,
        connectedClients: latest.connections?.connected_clients || 0,
        fragmentationRatio: latest.memory?.fragmentation_ratio || 0
      },
      averages: {
        opsPerSecond: Math.round(avgOpsPerSec * 100) / 100,
        hitRate: Math.round(avgHitRate * 100) / 100,
        memoryUsage: Math.round(avgMemoryUsage)
      },
      status: this.getOverallStatus(latest)
    };
  }

  /**
   * Determine overall Redis status
   */
  private getOverallStatus(metrics: any): string {
    const issues = [];

    if (metrics.memory?.fragmentation_ratio > 2.0) issues.push('high_fragmentation');
    if (metrics.operations?.hit_rate < 80) issues.push('low_hit_rate');
    if (metrics.connections?.connected_clients > 1000) issues.push('high_connections');
    if (metrics.operations?.instantaneous_ops_per_sec > 10000) issues.push('high_ops');

    if (issues.length === 0) return 'excellent';
    if (issues.length === 1) return 'good';
    if (issues.length === 2) return 'warning';
    return 'critical';
  }

  /**
   * Generate monitoring report
   */
  public generateReport(): any {
    const summary = this.getPerformanceSummary();
    const connectionStatus = redisManager.getConnectionStatus();
    
    return {
      timestamp: Date.now(),
      overview: summary,
      connections: connectionStatus,
      recommendations: this.generateRecommendations(summary),
      dataPoints: this.metricsHistory.length,
      monitoringActive: !!this.monitoringInterval
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(summary: any): string[] {
    const recommendations = [];

    if (summary.current?.fragmentationRatio > 2.0) {
      recommendations.push('Consider running MEMORY DEFRAG to reduce fragmentation');
    }

    if (summary.current?.hitRate < 80) {
      recommendations.push('Optimize cache keys and TTL settings to improve hit rate');
    }

    if (summary.current?.connectedClients > 500) {
      recommendations.push('Monitor client connections and consider connection pooling');
    }

    if (summary.current?.opsPerSecond > 8000) {
      recommendations.push('Consider scaling Redis or optimizing operations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Redis performance is optimal');
    }

    return recommendations;
  }
}

// Export singleton instance
export const redisMonitoring = RedisMonitoringService.getInstance();

// Auto-start monitoring when module is imported
(async () => {
  try {
    redisMonitoring.startMonitoring();
  } catch (error) {
    console.error('Failed to start Redis monitoring:', error);
  }
})();
