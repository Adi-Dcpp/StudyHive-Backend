import mongoose from "mongoose";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";

const healthCheck = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;

  /*
    mongoose.connection.readyState values:
    0 = disconnected
    1 = connected
    2 = connecting
    3 = disconnecting
  */

  const isDbConnected = dbState === 1;

  return res.status(isDbConnected ? 200 : 503).json(
    new ApiResponse(
      isDbConnected ? 200 : 503,
      isDbConnected ? "Service is healthy" : "Service is unhealthy",
      {
        status: isDbConnected ? "UP" : "DOWN",
        database: isDbConnected ? "CONNECTED" : "DISCONNECTED",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    ),
  );
});

export { healthCheck };
