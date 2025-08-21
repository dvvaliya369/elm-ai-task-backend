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
};
