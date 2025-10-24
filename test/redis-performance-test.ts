import { likeService } from '../service/high-performance-like.service';
import { redisManager } from '../config/redis-optimized.config';

/**
 * Stress test for the Redis like system
 */
async function performanceTest() {
  console.log('🚀 Starting Redis Like System Performance Test');
  console.log('================================================');

  const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    responseTimes: [] as number[],
    likesPerSecond: 0,
    errors: [] as string[]
  };

  // Test configuration
  const CONCURRENT_USERS = 100;
  const REQUESTS_PER_USER = 10;
  const TOTAL_REQUESTS = CONCURRENT_USERS * REQUESTS_PER_USER;
  const POST_COUNT = 50; // Number of different posts to test

  console.log(`📊 Test Configuration:`);
  console.log(`   • Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   • Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`   • Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`   • Post Count: ${POST_COUNT}`);
  console.log('');

  const startTime = Date.now();

  // Create concurrent user simulation
  const userPromises = [];
  for (let userId = 0; userId < CONCURRENT_USERS; userId++) {
    const userPromise = simulateUser(userId, REQUESTS_PER_USER, POST_COUNT, results);
    userPromises.push(userPromise);
  }

  // Wait for all users to complete
  await Promise.allSettled(userPromises);

  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000; // seconds

  // Calculate statistics
  results.totalRequests = TOTAL_REQUESTS;
  results.averageResponseTime = results.responseTimes.length > 0 
    ? results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length 
    : 0;
  results.maxResponseTime = Math.max(...results.responseTimes);
  results.minResponseTime = Math.min(...results.responseTimes);
  results.likesPerSecond = results.successfulRequests / totalDuration;

  // Print results
  printResults(results, totalDuration);

  // Get final Redis metrics
  await printRedisMetrics();
}

/**
 * Simulate a single user performing multiple like operations
 */
async function simulateUser(
  userId: number, 
  requestCount: number, 
  postCount: number, 
  results: any
): Promise<void> {
  for (let i = 0; i < requestCount; i++) {
    const postId = `post_${Math.floor(Math.random() * postCount)}`;
    const userIdStr = `user_${userId}`;
    
    const startTime = Date.now();
    
    try {
      // Randomly choose between add and remove operations
      const operation = Math.random() > 0.5 ? 'add' : 'toggle';
      let result;

      if (operation === 'add') {
        result = await likeService.addLike(postId, userIdStr);
      } else {
        // Use toggle to create more realistic scenarios
        const hasLiked = await likeService.hasUserLiked(postId, userIdStr);
        if (hasLiked) {
          result = await likeService.removeLike(postId, userIdStr);
        } else {
          result = await likeService.addLike(postId, userIdStr);
        }
      }

      const responseTime = Date.now() - startTime;
      results.responseTimes.push(responseTime);

      if (result && result.success) {
        results.successfulRequests++;
      } else {
        results.failedRequests++;
        if (result && result.message) {
          results.errors.push(result.message);
        }
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.responseTimes.push(responseTime);
      results.failedRequests++;
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    // Small random delay to simulate real user behavior
    if (i < requestCount - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    }
  }
}

/**
 * Print test results
 */
function printResults(results: any, duration: number): void {
  console.log('🎯 PERFORMANCE TEST RESULTS');
  console.log('============================');
  console.log('');

  // Basic metrics
  console.log('📊 Request Metrics:');
  console.log(`   • Total Requests: ${results.totalRequests}`);
  console.log(`   • Successful: ${results.successfulRequests} (${((results.successfulRequests / results.totalRequests) * 100).toFixed(1)}%)`);
  console.log(`   • Failed: ${results.failedRequests} (${((results.failedRequests / results.totalRequests) * 100).toFixed(1)}%)`);
  console.log('');

  // Response time metrics
  console.log('⏱️  Response Time Metrics:');
  console.log(`   • Average: ${results.averageResponseTime.toFixed(2)}ms`);
  console.log(`   • Min: ${results.minResponseTime}ms`);
  console.log(`   • Max: ${results.maxResponseTime}ms`);
  console.log('');

  // Throughput metrics
  console.log('🚀 Throughput Metrics:');
  console.log(`   • Test Duration: ${duration.toFixed(2)}s`);
  console.log(`   • Likes per Second: ${results.likesPerSecond.toFixed(2)}`);
  console.log(`   • Requests per Second: ${(results.totalRequests / duration).toFixed(2)}`);
  console.log('');

  // Performance classification
  const classification = classifyPerformance(results.likesPerSecond, results.averageResponseTime);
  console.log(`🏆 Performance Classification: ${classification}`);
  console.log('');

  // Error analysis
  if (results.errors.length > 0) {
    console.log('❌ Error Analysis:');
    const errorCounts = results.errors.reduce((acc: any, error: string) => {
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {});

    Object.entries(errorCounts).forEach(([error, count]) => {
      console.log(`   • ${error}: ${count} occurrences`);
    });
    console.log('');
  }

  // Performance benchmarks
  console.log('📈 Performance Benchmarks:');
  console.log(`   • Target: 1,000+ likes/second ✅ ${results.likesPerSecond >= 1000 ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
  console.log(`   • Target: <100ms avg response ✅ ${results.averageResponseTime < 100 ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
  console.log(`   • Target: <1% error rate ✅ ${((results.failedRequests / results.totalRequests) * 100) < 1 ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
  console.log('');
}

/**
 * Classify performance based on metrics
 */
function classifyPerformance(likesPerSecond: number, avgResponseTime: number): string {
  if (likesPerSecond >= 5000 && avgResponseTime < 30) {
    return '🥇 EXCELLENT (Production Ready for High Scale)';
  } else if (likesPerSecond >= 2000 && avgResponseTime < 50) {
    return '🥈 VERY GOOD (Production Ready)';
  } else if (likesPerSecond >= 1000 && avgResponseTime < 100) {
    return '🥉 GOOD (Suitable for Medium Scale)';
  } else if (likesPerSecond >= 500 && avgResponseTime < 200) {
    return '⚠️  FAIR (Needs Optimization)';
  } else {
    return '❌ POOR (Requires Significant Improvement)';
  }
}

/**
 * Print Redis metrics and health
 */
async function printRedisMetrics(): Promise<void> {
  try {
    console.log('💾 REDIS METRICS');
    console.log('==================');

    // Get Redis connection status
    const connectionStatus = redisManager.getConnectionStatus();
    console.log('🔗 Connection Status:');
    Object.entries(connectionStatus).forEach(([key, value]) => {
      console.log(`   • ${key}: ${value}`);
    });
    console.log('');

    // Get like service health
    const healthCheck = await likeService.healthCheck();
    console.log('🏥 Service Health:');
    console.log(`   • Status: ${healthCheck.status}`);
    console.log(`   • Queue Length: ${healthCheck.queueLength}`);
    console.log('');

    // Get sample statistics
    const sampleStats = await likeService.getLikeStats('post_0');
    console.log('📊 Sample Post Statistics:');
    console.log(`   • Total Likes: ${sampleStats.totalLikes}`);
    console.log(`   • Unique Users: ${sampleStats.uniqueUsers}`);
    console.log(`   • Likes per Second: ${sampleStats.likesPerSecond}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error getting Redis metrics:', error);
  }
}

// Export for external use
export {
  performanceTest
};

// Run test if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for Redis to connect
      await performanceTest();
      process.exit(0);
    } catch (error) {
      console.error('❌ Test failed:', error);
      process.exit(1);
    }
  })();
}
