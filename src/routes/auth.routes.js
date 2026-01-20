import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  login,
  getCurrentUser,
  logOut,
  refreshAccessToken,
  resendEmailVerification,
  forgotPasswordRequest,
  resetForgotPassword,
  changeCurrentPassword,
} from "../controllers/auth.controllers.js";

import { verifyJwt } from "../middlewares/auth.middlewares.js";
import validate from "../middlewares/validators.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";

import {
  userRegisterValidator,
  userLoginValidator,
  tokenValidator,
  emailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  refreshTokenValidator,
} from "../validators/index.validators.js";

const router = Router();

//public Routes

// Register
router.post(
  "/register",
  userRegisterValidator(),
  validate,
  registerUser
);

// Login
router.post(
  "/login",
  userLoginValidator(),
  validate,
  login
);

// Verify email
router.get(
  "/verify-email/:token",
  tokenValidator(),
  validate,
  verifyEmail
);

// Resend email verification
router.post(
  "/resend-email-verification",
  emailValidator(),
  validate,
  resendEmailVerification
);

// Forgot password (request)
router.post(
  "/forgot-password",
  forgotPasswordValidator(),
  validate,
  forgotPasswordRequest
);

// Reset forgotten password
router.post(
  "/reset-password/:token",
  resetPasswordValidator(),
  validate,
  resetForgotPassword
);

// Refresh access token
router.post(
  "/refresh-token",
  refreshTokenValidator(),
  validate,
  refreshAccessToken
);

//protected Routes

// Get current logged-in user
router.get(
  "/me",
  verifyJwt,
  getCurrentUser
);

// Change password (logged-in user)
router.post(
  "/change-password",
  verifyJwt,
  changePasswordValidator(),
  validate,
  changeCurrentPassword
);

// Logout
router.post(
  "/logout",
  verifyJwt,
  logOut
);

export default router;
