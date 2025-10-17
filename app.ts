import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "./config/env.config";
import "./config/db.config";
import "./config/redis.config";
import express from "express";
import session from "express-session";
import passport from "./config/passport.config";
import corsOption from "./config/cors.config";
import Auth from "./routes/auth.route";
import PassportAuth from "./routes/passport.route";
import Protected from "./routes/protected.route";
import Post from "./routes/post.route";
import Profile from "./routes/profile.route";

const app = express();

// Session configuration (required for Passport.js)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Other Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Middleware
app.use(`/api/auth`, Auth);
app.use(`/api/passport-auth`, PassportAuth); // New Passport.js routes
app.use(`/api/protected`, Protected); // Protected routes examples
app.use(`/api/post`, Post);
app.use(`/api/profile`, Profile);

// Serve static HTML files for testing
app.use('/views', express.static('views'));

// default route
app.get("/", (_req, res) => {
  res.send("Hello World");
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
