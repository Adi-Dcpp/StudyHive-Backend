import { ApiError } from "../utils/api-error.utils.js";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RateLimitPolicies } from "../utils/constants.utils.js";

const validate429Headers = (req, res) => {
  const limiter = req.rateLimit;
  if (!limiter) {
    return;
  }

  if (Number.isFinite(limiter.limit)) {
    res.setHeader("X-RateLimit-Limit", String(limiter.limit));
  }

  if (Number.isFinite(limiter.remaining)) {
    res.setHeader("X-RateLimit-Remaining", String(limiter.remaining));
  }

  if (limiter.resetTime instanceof Date) {
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((limiter.resetTime.getTime() - Date.now()) / 1000),
    );

    res.setHeader("X-RateLimit-Reset", String(Math.floor(limiter.resetTime.getTime() / 1000)));
    res.setHeader("Retry-After", String(retryAfterSeconds));
  }
};

export const globalRate = rateLimit({
  windowMs: RateLimitPolicies.GLOBAL.windowMs,
  limit: RateLimitPolicies.GLOBAL.limit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    validate429Headers(req, res);
    next(new ApiError(429, "Too many requests. Please try again later."));
  },
});

export const userRate = rateLimit({
  windowMs: RateLimitPolicies.USER.windowMs,
  limit: RateLimitPolicies.USER.limit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    validate429Headers(req, res);
    next(new ApiError(429, "Too many requests from this account."));
  },
});

export const ipAuthRate = rateLimit({
  windowMs: RateLimitPolicies.IP_AUTH.windowMs,
  limit: RateLimitPolicies.IP_AUTH.limit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    validate429Headers(req, res);
    next(new ApiError(429, "Too many authentication attempts."));
  },
});