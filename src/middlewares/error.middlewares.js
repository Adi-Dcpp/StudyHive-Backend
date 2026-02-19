import { ApiError } from "../utils/api-error.utils.js";

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  const message =
    err instanceof ApiError
      ? err.message
      : "Internal Server Error";

  const errors =
    err instanceof ApiError
      ? err.errors || []
      : [];

  // Structured logging using pino (req.log comes from pino-http)
  if (req.log) {
    req.log.error({
      message: err.message,
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
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export { globalErrorHandler };