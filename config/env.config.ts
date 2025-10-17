export default {
  API_URL: process.env.API_URL,
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET_AUTH, // Added for passport JWT strategy
  JWT_SECRET_AUTH: process.env.JWT_SECRET_AUTH,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
  DB_URL: process.env.DB_URL,
  DOMAIN: process.env.DOMAIN as string,
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-secret-key', // Added for session management
  
  // Google OAuth configuration
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',

  // GitHub OAuth configuration
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',

  // Facebook OAuth configuration
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',

  GCS_PROJECT_ID: process.env.GCS_PROJECT_ID || "",
  GCS_BUCKET_NAME: process.env.GCS_BUCKET_NAME || "",

  // REDIS_URL: process.env.REDIS_URL // for redis cloud
};
