export const UserRolesEnum = {
  ADMIN: "admin",
  MENTOR: "mentor",
  LEARNER: "learner",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TokenDefaults = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  EMAIL_AND_FORGOT_TOKEN_TTL_MS: 10 * 60 * 1000,
  REFRESH_COOKIE_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000,
};

export const RequestLimits = {
  JSON_BODY_LIMIT: "16kb",
  URLENCODED_BODY_LIMIT: "16kb",
  FILE_UPLOAD_MAX_BYTES: 5 * 1024 * 1024,
};

export const RateLimitPolicies = {
  GLOBAL: {
    windowMs: 15 * 60 * 1000,
    limit: 100,
  },
  USER: {
    windowMs: 5 * 60 * 1000,
    limit: 20,
  },
  IP_AUTH: {
    windowMs: 5 * 60 * 1000,
    limit: 5,
  },
};

export const LoggerPolicy = {
  DEV_LEVEL: "debug",
  PROD_LEVEL: "info",
};

export const paginationDefaults = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MAX_PAGE: 1000,
};