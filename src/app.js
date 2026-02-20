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

const app = express();
app.set("trust proxy", 1);

//cors config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",")
      : ["http://localhost:5173"],
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
  }),
);

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
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
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(hpp());
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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/goals", goalsRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/submissions", submissionRouter);
app.use("/api/v1/resources", resourceRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

app.use(globalErrorHandler);

app.get("/", (req, res) => {
  res.send("StudyHive backend running 🚀");
});

export default app;
