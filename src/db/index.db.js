import mongoose from "mongoose";
import pino from "pino";
import { LoggerPolicy } from "../utils/constants.utils.js";

const logger = pino({
  level:
    process.env.NODE_ENV === "production"
      ? LoggerPolicy.PROD_LEVEL
      : LoggerPolicy.DEV_LEVEL,
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");
    process.exit(1);
  }
};

export default connectDB;
