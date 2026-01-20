import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.utils.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Username Field Can't Be Empty"],
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "mentor", "learner"],
      default: "learner",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,

    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,
  },
  { timestamps: true },
);

userSchema.methods.generateAccessToken = function () {
  return generateAccessToken({
    _id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return generateRefreshToken({
    _id: this._id,
  });
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
