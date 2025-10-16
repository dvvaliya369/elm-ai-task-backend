import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "./config/env.config";
import "./config/db.config";
import "./config/redis.config";
import express from "express";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import corsOption from "./config/cors.config";
import Auth from "./routes/auth.route";
import Post from "./routes/post.route";
import Profile from "./routes/profile.route";
import Favorite from "./routes/favorite.route";


const app = express();
// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Middleware
app.use(`/api/auth`, Auth);
app.use(`/api/post`, Post);
app.use(`/api/profile`, Profile);
app.use(`/api/favorites`, Favorite);

// Swagger Documentation - Only for Post Routes
app.use('/api/docs/posts', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: false,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Post API Documentation'
}));

// default route
app.get("/", (_req, res) => {
  res.send("Hello World - API Documentation available at /api/docs/posts");
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
