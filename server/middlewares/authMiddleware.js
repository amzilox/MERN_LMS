import { clerkClient } from "@clerk/express";

// Middleware (Protect Educator Routes)
export const protectEducator = async (req, res, next) => {
  try {
    const { userId } = req.auth;

    // Check if userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID",
      });
    }

    // Get user from Clerk
    const response = await clerkClient.users.getUser(userId);

    // Check if user has educator role
    if (response.publicMetadata.role !== "educator") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Access - Educator role required",
      });
    }

    // Attach user data to request for use in routes
    req.user = response;

    // All checks passed, continue to next middleware/route
    next();
  } catch (error) {
    console.error("Educator protection error:", error);

    // Return error response and don't call next()
    return res.status(500).json({
      success: false,
      message: error.message || "Authentication error",
    });
  }
};
