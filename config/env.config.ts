export default {
  API_URL: process.env.API_URL,
  PORT: process.env.PORT || 8000,
  JWT_SECRET_AUTH: process.env.JWT_SECRET_AUTH,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
  DB_URL: process.env.DB_URL,
  DOMAIN: process.env.DOMAIN as string,

  GCS_PROJECT_ID: process.env.GCS_PROJECT_ID || "",
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || "",

  // Redis Configuration
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379"),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB || "0"),
  REDIS_ENABLE_TLS: process.env.REDIS_ENABLE_TLS === "true",
  REDIS_MAX_RETRIES: parseInt(process.env.REDIS_MAX_RETRIES || "3"),
  REDIS_RETRY_DELAY_MS: parseInt(process.env.REDIS_RETRY_DELAY_MS || "5000")
};
