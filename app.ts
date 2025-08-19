import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import "./config/env.config";
import "./config/db.config";
import express from "express";
const app = express();

import corsOption from "./config/cors.config";
import Auth from "./routes/auth.route";

// Middleware
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Middleware
app.use(`/api/auth`, Auth);

// default route
app.get("/", (_req, res) => {
  res.send("Hello World");
});

export default app;
