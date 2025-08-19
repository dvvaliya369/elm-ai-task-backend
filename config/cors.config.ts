import cors from "cors";
import envConfig from "./env.config";

const corsOption: cors.CorsOptions = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
    "Authorization",
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: envConfig.DOMAIN,
  preflightContinue: false,
};

export default corsOption;
