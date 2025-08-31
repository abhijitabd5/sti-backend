import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./config/database.js";
import { connectRedis } from "./config/redis.js";
import logger from "./config/logger.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info("Database connection has been established successfully.");

    // Test Redis connection
    if (process.env.REDIS_ENABLED === "true") {
      await connectRedis();
      logger.info("Redis connection has been established successfully.");
    } else {
      logger.info("Redis is disabled via .env");
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error("Unable to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

startServer();
