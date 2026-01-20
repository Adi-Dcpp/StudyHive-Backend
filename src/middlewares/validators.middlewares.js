import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.utils.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));

    throw new ApiError(400, "Validation failed", extractedErrors);
  }

  next();
};

export default validate;
