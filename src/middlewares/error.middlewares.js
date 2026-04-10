import { ApiError } from "../utils/api-error.utils.js";
import pino from "pino";
import { LoggerPolicy } from "../utils/constants.utils.js";

const fallbackLogger = pino({
  level:
    process.env.NODE_ENV === "production"
      ? LoggerPolicy.PROD_LEVEL
      : LoggerPolicy.DEV_LEVEL,
});

const normalizeError = (err) => {
  if (err instanceof ApiError) {
    return err;
  }

  if (err?.name === "TokenExpiredError") {
    return new ApiError(401, "Access token expired");
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "NotBeforeError") {
    return new ApiError(401, "Invalid access token");
  }

  if (err?.name === "CastError") {
    return new ApiError(400, `Invalid ${err.path || "value"}`);
  }

  if (err?.name === "ValidationError") {
    const extractedErrors = Object.values(err.errors || {}).map((validationErr) => ({
      field: validationErr.path,
      message: validationErr.message,
    }));

    return new ApiError(400, "Validation failed", extractedErrors);
  }

  if (err?.name === "MongoServerError" && err?.code === 11000) {
  // group membership duplicate
  if (err.keyPattern?.group && err.keyPattern?.user) {
    return new ApiError(409, "User is already a member of this group");
  }

  const field = Object.keys(err.keyValue || {})[0] || "field";
  return new ApiError(409, `${field} already exists`);
}

  if (err?.message === "Not allowed by CORS") {
    return new ApiError(403, "CORS origin not allowed");
  }

  return new ApiError(500, "Internal Server Error");
};

const globalErrorHandler = (err, req, res, _next) => {
  const normalizedError = normalizeError(err);
  const { statusCode, message, errors } = normalizedError;
  const logLevel = statusCode >= 500 ? "error" : "warn";

  // Structured logging using pino (req.log comes from pino-http)
  if (req.log) {
    req.log[logLevel]({
      message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id || null,
      stack:
        process.env.NODE_ENV === "production"
          ? undefined
          : err.stack,
    });
  } else {
    fallbackLogger[logLevel]({
      message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id || null,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
  });
};

export { globalErrorHandler };