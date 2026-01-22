import { globalErrorHandler } from "./middlewares/error.middlewares.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//basic app config
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//cors config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "https://localhost:5173",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//import Routes
import authRouter from "./routes/auth.routes.js";
import groupRouter from "./routes/group.routes.js";
import goalsRouter from "./routes/goal.routes.js";


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/goals", goalsRouter);


app.use(globalErrorHandler);

app.get("/", (req, res) => {
  res.send("StudyHive backend running 🚀");
});

export default app;
