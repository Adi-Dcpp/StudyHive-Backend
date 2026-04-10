import { globalErrorHandler } from "./middlewares/error.middlewares.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import pino from "pino";
import pinoHttp from "pino-http";
import { globalRate } from "./middlewares/rateLimiter.middlewares.js";
import mongoSanitize from "express-mongo-sanitize";
import { ApiError } from "./utils/api-error.utils.js";
import { randomUUID } from "node:crypto";
import { LoggerPolicy, RequestLimits } from "./utils/constants.utils.js";

const app = express();
app.set("trust proxy", 1);

//cors config

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / curl (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new ApiError(403, "CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"]
  })
);

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

//basic app config
app.use(helmet());
app.use(
  pinoHttp({
    logger,
    genReqId: () => randomUUID(),
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) {
        return "error";
      }

      if (res.statusCode >= 400) {
        return "warn";
      }

      return "info";
    },
    customSuccessMessage: (req, res) => `${res.statusCode} ${req.method} ${req.url}`,
    customErrorMessage: (req, res, err) =>
      `${res.statusCode} ${req.method} ${req.url} - ${err?.message || "Request failed"}`,
  }),
);
app.use(hpp()); // no duplicate query params
app.use(express.json({ limit: RequestLimits.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: RequestLimits.URLENCODED_BODY_LIMIT }));
app.use((req, _res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      mongoSanitize.sanitize(req.body);
    }

    if (req.params && typeof req.params === "object") {
      mongoSanitize.sanitize(req.params);
    }

    if (req.query && typeof req.query === "object") {
      mongoSanitize.sanitize(req.query);
    }

    next();
  } catch (_error) {
    next(new ApiError(400, "Invalid request payload"));
  }
}); // Remove $ and . from req.body, req.query, and req.params to prevent NoSQL injection
// Never expose temp uploads from static hosting.
app.use("/temp", (_req, _res, next) => {
  return next(new ApiError(404, "Not found")); // Prevent access to temp uploads
});
app.use(express.static("public"));
app.use(cookieParser());

app.use(globalRate);

//import Routes
import authRouter from "./routes/auth.routes.js";
import groupRouter from "./routes/group.routes.js";
import goalsRouter from "./routes/goal.routes.js";
import assignmentRouter from "./routes/assignment.routes.js";
import submissionRouter from "./routes/submission.routes.js";
import resourceRouter from "./routes/resource.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/goals", goalsRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/submissions", submissionRouter);
app.use("/api/v1/resources", resourceRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.get("/", (req, res) => {
  res.send("StudyHive backend running 🚀");
});

app.use((req, _res, next) => {
  return next(new ApiError(404, `Route  ${req.method} ${req.originalUrl} not found`));
});

app.use(globalErrorHandler);


export default app;
