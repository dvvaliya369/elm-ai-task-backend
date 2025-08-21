import * as redis from "redis";
// import envConfig from "./env.config";

// {
//   url: envConfig.REDIS_URL,
//   socket: {
//     tls: true,
//   },
// }

const redisClient = redis.createClient();

(async (): Promise<void> => {
  try {
    redisClient.on("error", (err) => {
      console.error("Redis connection failed!", err);
      process.exit(1);
    });

    redisClient.on("ready", () => {
      console.info("Redis ready");
    });

    await redisClient.connect();
    console.info("Redis connected successfully");

    await redisClient.ping();
  } catch (err) {
    console.error("Redis connection failed!", err);
    throw err;
  }
})();

export default redisClient;
