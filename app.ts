import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import session from "express-session";
import "./config/env.config";
import "./config/db.config";
import "./config/redis.config";
import express from "express";
import corsOption from "./config/cors.config";
import { initializePassport, passportSession } from "./middleware/passport.enhanced";

// Routes - using enhanced Passport.js routes
import AuthEnhanced from "./routes/auth.route.enhanced";
import Post from "./routes/post.route";
import Profile from "./routes/profile.route";
import envConfig from "./config/env.config";

const app = express();

// Session configuration (optional - for session-based authentication)
app.use(session({
  secret: envConfig.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(initializePassport());
app.use(passportSession());

// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Middleware
app.use(`/api/auth`, AuthEnhanced);
app.use(`/api/post`, Post);
app.use(`/api/profile`, Profile);

// default route
app.get("/", (_req, res) => {
  res.send("Hello World - Enhanced with Passport.js Authentication");
});

// Global error handler
app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('Global error handler:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

export default app;
