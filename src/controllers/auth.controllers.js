import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import asyncHandler from "../utils/async-handler.utils.js";
import { User } from "../models/user.models.js";
import sendEmail from "../utils/send-email.utils.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail-template.utils.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User Not Found!!!");
    }
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, error.message || "Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.toLowerCase();

  const isUserExist = await User.findOne({
    $or: [{ email: normalizedEmail }, { name }],
  });

  if (isUserExist) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.name,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  );

  if (!createdUser) {
    throw new ApiError(404, "User Not Created");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "User registered successfully and verification email has been sent to your mail",
        { user: createdUser },
      ),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError(400, "Verification token not found");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;
  user.refreshToken = undefined;

  user.isEmailVerified = true;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, "Email verified successfully", {
      isEmailVerified: true,
    }),
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All f`ield required");
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordValid(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is incorrect");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  if (!loggedInUser) {
    throw new ApiError(400, "failed to login");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User successfully logged In", {
        user: loggedInUser,
      }),
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  );

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "current user fetched successfully", {
      user,
    }),
  );
});

const logOut = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Failed to get user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or reused");
  }

  const { refreshToken: newRefreshToken, accessToken } =
    await generateRefreshAndAccessToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, "Access token successfully refreshed", {}));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If the email exists, a verification link has been sent",
          {},
        ),
      );
  }

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.isEmailVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If the email exists, a verification link has been sent",
          {},
        ),
      );
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Verify Email",
    mailgenContent: emailVerificationMailgenContent(
      user.name,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "If the email exists, a verification link has been sent",
        {},
      ),
    );
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "If the email exists, a reset link has been sent",
          {},
        ),
      );
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Reset Password",
    mailgenContent: forgotPasswordMailgenContent(
      user.name,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "If the email exists, reset link has been sent",
        {},
      ),
    );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(401, "Forgot password session expired or invalid user");
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset Successfully", {}));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old Password");
  }

  user.password = newPassword;
  user.refreshToken = undefined;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Changed Successfully", {}));
});

export {
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
};
