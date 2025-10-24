import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import session from "express-session";
import "./config/env.config";
import "./config/db.config";
import "./config/redis.config";
import "./config/passport.config"; // Initialize passport config
import express from "express";
import passport from "passport";
import corsOption from "./config/cors.config";
import envConfig from "./config/env.config";
import Auth from "./routes/auth.route";
import Post from "./routes/post.route";
import Profile from "./routes/profile.route";


const app = express();

// Session middleware (required for passport)
app.use(session({
  secret: envConfig.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Other Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
