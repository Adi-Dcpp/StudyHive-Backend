import dotenv from "dotenv";
dotenv.config();
const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./db/index.db.js");
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handler
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");

      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

// Listen for termination signals
process.on("SIGINT", () => shutdown("SIGINT"));   // CTRL+C
process.on("SIGTERM", () => shutdown("SIGTERM")); // Render / Docker