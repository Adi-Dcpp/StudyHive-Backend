import { ApiError } from "../utils/api-error.utils.js";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const globalRate = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many requests. Please try again later."));
  },
});

export const userRate = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many requests from this account."));
  },
});

export const ipAuthRate = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many authentication attempts."));
  },
});