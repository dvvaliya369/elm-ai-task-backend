import mongoose, { ConnectOptions } from "mongoose";
import envConfig from "./env.config";

(async (): Promise<void> => {
  try {
    await mongoose.connect(
      envConfig.DB_URL as string,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions
    );
    console.info("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      console.error("DB connection failed!", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
})();
