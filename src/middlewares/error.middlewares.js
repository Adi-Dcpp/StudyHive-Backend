import { ApiError } from "../utils/api-error.utils.js";

const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);
  // Default values
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  // If it's our custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export { globalErrorHandler };
