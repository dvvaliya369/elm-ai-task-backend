import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "./config/env.config";
import "./config/db.config";
import "./config/redis.config";
import express from "express";
import session from "express-session";
import corsOption from "./config/cors.config";
import passport from "./config/passport.config";
import Auth from "./routes/auth.route";
import Post from "./routes/post.route";
import Profile from "./routes/profile.route";
import envConfig from "./config/env.config";


const app = express();
// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for Passport
app.use(
  session({
    secret: envConfig.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes Middleware
app.use(`/api/auth`, Auth);
app.use(`/api/post`, Post);
app.use(`/api/profile`, Profile);

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
