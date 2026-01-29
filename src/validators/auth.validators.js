import pkg from "express-validator";
const { body, cookie, param } = pkg;

const userRegisterValidator = () => {
  return [
    body("name")
      .exists()
      .withMessage("Name field can't be empty")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Name must me greater or equal to 3 characters"),
    body("password")
      .exists()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .isStrongPassword({
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain uppercase, lowercase, number and special character",
      ),
    body("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("role").optional().isIn(["admin", "mentor", "learner"]),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
    body("password").exists().withMessage("Password is required").notEmpty(),
  ];
};

const tokenValidator = () => {
  return [param("token").exists().notEmpty()];
};

const emailValidator = () => {
  return [
    body("email")
      .exists()
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ];
};

const forgotPasswordValidator = () => [
  body("email").exists().isEmail().withMessage("Valid email is required"),
];

const resetPasswordValidator = () => [
  param("token").exists().withMessage("Token is required"),

  body("newPassword")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isStrongPassword({
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character",
    ),
];
const changePasswordValidator = () => {
  return [
    body("oldPassword").exists().notEmpty(),
    body("newPassword")
      .exists()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .isStrongPassword({
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must contain uppercase, lowercase, number and special character",
      ),
  ];
};

const refreshTokenValidator = () => {
  return [
    body("refreshToken")
      .optional()
      .isString()
      .withMessage("Refresh token must be a string"),

    cookie("refreshToken")
      .optional()
      .isString()
      .withMessage("Refresh token must be a string"),

    body().custom((_, { req }) => {
      if (!req.cookies?.refreshToken && !req.body?.refreshToken) {
        throw new Error("Refresh token is required");
      }
      return true;
    }),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  tokenValidator,
  emailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  refreshTokenValidator,
};
