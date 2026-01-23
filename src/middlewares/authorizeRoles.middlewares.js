import { ApiError } from "../utils/api-error.utils.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, "Unauthorized request"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(
        403,
        "You do not have permission to perform this action",
      ));
    }

    next();
  };
};

export { authorizeRoles };
