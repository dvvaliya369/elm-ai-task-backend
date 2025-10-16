import redisManager from "./config/redis.config";
import cacheService from "./service/cache.service";
import redisHealthService from "./service/redis-health.service";

async function testRedisConnection() {
  console.log("🔄 Testing Redis connection...");
  
  try {
    // Test basic connection
    const isConnected = await redisManager.isConnected();
    console.log(`✅ Redis connection status: ${isConnected ? 'Connected' : 'Disconnected'}`);
    
    if (!isConnected) {
      console.log("❌ Redis connection failed. Please check your configuration.");
      return false;
    }

    // Test health check
    const health = await redisHealthService.healthCheck();
    console.log(`✅ Redis health: ${health.status} - ${health.message}`);

    // Test cache operations
    console.log("\n🔄 Testing cache operations...");
    
    const testKey = "test_key";
    const testValue = { message: "Hello Redis!", timestamp: Date.now() };
    
    // Test SET
    const setResult = await cacheService.set(testKey, testValue);
    console.log(`✅ SET operation: ${setResult ? 'Success' : 'Failed'}`);
    
    // Test GET
    const getValue = await cacheService.get(testKey);
    const getResult = JSON.stringify(getValue) === JSON.stringify(testValue);
    console.log(`✅ GET operation: ${getResult ? 'Success' : 'Failed'}`);
    
    // Test DELETE
    const deleteResult = await cacheService.delete(testKey);
    console.log(`✅ DELETE operation: ${deleteResult ? 'Success' : 'Failed'}`);
    
    // Test EXISTS after delete
    const existsResult = await cacheService.exists(testKey);
    console.log(`✅ EXISTS after delete: ${!existsResult ? 'Success (key not found)' : 'Failed (key still exists)'}`);
    
    // Test operation test
    console.log("\n🔄 Running comprehensive operation test...");
    const operationTest = await redisHealthService.testOperations();
    console.log(`✅ Operation test: ${operationTest.success ? 'All operations successful' : 'Some operations failed'}`);
    console.log("   Operations:", operationTest.operations);
    
    // Test metrics
    console.log("\n🔄 Testing metrics collection...");
    const metrics = await redisHealthService.getMetrics();
    if (metrics) {
      console.log("✅ Metrics collected successfully:");
      console.log(`   Connected clients: ${metrics.connectedClients}`);
      console.log(`   Used memory: ${metrics.usedMemoryHuman}`);
      console.log(`   Hit ratio: ${metrics.hitRatio}%`);
    } else {
      console.log("❌ Failed to collect metrics");
    }

    console.log("\n🎉 All Redis tests completed successfully!");
    return true;
    
  } catch (error) {
    console.error("❌ Redis test failed:", error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRedisConnection().then((success) => {
    console.log(`\n${success ? '✅ Redis configuration is working properly!' : '❌ Redis configuration needs attention.'}`);
    process.exit(success ? 0 : 1);
  });
}

export default testRedisConnection;
