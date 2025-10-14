import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import pool from "./db.js"; // Import the pool for graceful shutdown
dotenv.config();

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Create server instance for graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Routes
app.use("/event", eventRoutes);
app.use("/post", postRoutes);
app.use("/club", clubRoutes);
app.use("/user", userRoutes);
app.use("/otp", otpRoutes);
app.use("/comment", commentRoutes);
app.use("/education", educationRoutes);
app.use("/like", likeRoutes);

// Environment logging
console.log("Environment:", process.env.NODE_ENV || "development");
console.log("Port:", process.env.PORT || 5000);
console.log("Database URL:", process.env.DATABASE_URL ? "Set" : "Not set");

// Keep-alive mechanism
setInterval(() => {
  console.log(`Server alive at ${new Date().toISOString()}`);
}, 30000); // Log every 30 seconds

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed.");

    // Close database pool
    pool.end(() => {
      console.log("Database pool closed.");
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
