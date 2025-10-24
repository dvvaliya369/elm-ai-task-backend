import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "./config/env.config";
import "./config/db.config";
import "./config/redis.config";
import express from "express";
import corsOption from "./config/cors.config";
import Auth from "./routes/auth.route";
import Post from "./routes/post.route";
import Profile from "./routes/profile.route";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";

const app = express();
// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Social Media API Documentation",
  customfavIcon: "https://swagger.io/favicon.ico",
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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
