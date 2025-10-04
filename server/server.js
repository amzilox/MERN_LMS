import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkwebhook, stripeWebhooks } from "./controllers/webhooks.js";
import educatorRouter from "./routes/educatorRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.js";
import courseRouter from "./routes/courseRoutes.js";
import userRouter from "./routes/userRoutes.js";

// Initilize Express
const app = express();

// Connect to Databases
await connectDB();
await connectCloudinary();

// Middlewares
app.use(cors());

// CRITICAL: Stripe webhook MUST come BEFORE express.json()!!
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// NOW apply JSON parser for all OTHER routes
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.post("/clerk", clerkwebhook);
app.use("/api/educator", educatorRouter);
app.use("/api/courses", courseRouter);
app.use("/api/user", userRouter);

// 404 handler (runs if no route matches)
app.use((req, _, next) => {
  const error = new Error(`Can't find ${req.originalUrl} on this server!`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use((err, req, res, next) => {
  // Set default status code if not set
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: err.message,
  });
});

// Port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
