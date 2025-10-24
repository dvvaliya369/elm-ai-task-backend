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

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "Your App",

  // REDIS_URL: process.env.REDIS_URL // for redis cloud
};
