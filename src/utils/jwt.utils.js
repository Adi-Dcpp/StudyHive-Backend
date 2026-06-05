import jwt from "jsonwebtoken";
import { TokenDefaults } from "./constants.utils.js";

const ACCESS_TOKEN_EXPIRY =
  process.env.ACCESS_TOKEN_EXPIRY || TokenDefaults.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_EXPIRY =
  process.env.REFRESH_TOKEN_EXPIRY || TokenDefaults.REFRESH_TOKEN_EXPIRY;

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

export { generateAccessToken, generateRefreshToken };
