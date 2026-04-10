import dotenv from "dotenv";
dotenv.config();
const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./db/index.db.js");
import mongoose from "mongoose";
import pino from "pino";
import { LoggerPolicy } from "./utils/constants.utils.js";

const PORT = process.env.PORT || 3000;
const FORCE_SHUTDOWN_TIMEOUT_MS = 10_000;

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

let server;
let isShuttingDown = false;

const validateEnvOrExit = () => {
  const missingVars = [];

  const requiredVars = [
    "NODE_ENV",
    "MONGO_URI",
    "CORS_ORIGIN",
    "FRONTEND_URL",
    "BASE_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "FORGOT_PASSWORD_REDIRECT_URL",
  ];

  for (const envName of requiredVars) {
    if (!process.env[envName] || !process.env[envName].trim()) {
      missingVars.push(envName);
    }
  }

  const isProd = process.env.NODE_ENV === "production";

  const emailVars = isProd
    ? ["MAIL_FROM", "BREVO_API_KEY"]
    : ["MAILTRAP_HOST", "MAILTRAP_PORT", "MAILTRAP_USER", "MAILTRAP_PASS"];

  for (const envName of emailVars) {
    if (!process.env[envName] || !process.env[envName].trim()) {
      missingVars.push(envName);
    }
  }

  if (missingVars.length > 0) {
    for (const envName of missingVars) {
      logger.error(`[ENV] Missing required environment variable: ${envName}`);
    }
    process.exit(1);
  }

  const secretVars = ["ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"];
  for (const secretName of secretVars) {
    if (process.env[secretName].length < 64) {
      logger.error(`[ENV] ${secretName} must be at least 64 characters long`);
      process.exit(1);
    }
  }
};

const startServer = async () => {
  try {
    validateEnvOrExit();
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "Server startup failed");
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handler
const shutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) {
    logger.warn(`Shutdown already in progress. Ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error(
      `Force shutdown after ${FORCE_SHUTDOWN_TIMEOUT_MS / 1000} seconds`
    );
    process.exit(1);
  }, FORCE_SHUTDOWN_TIMEOUT_MS);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          logger.info("HTTP server closed");
          return resolve();
        });
      });
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    }

    clearTimeout(forceExit);
    process.exit(exitCode);
  } catch (err) {
    logger.error({ err }, "Shutdown error");
    clearTimeout(forceExit);
    process.exit(1);
  }
};

// Listen for termination signals
process.on("SIGINT", () => shutdown("SIGINT"));   // CTRL+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // Render / Docker

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled promise rejection");
  shutdown("UNHANDLED_REJECTION", 1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  shutdown("UNCAUGHT_EXCEPTION", 1);
});