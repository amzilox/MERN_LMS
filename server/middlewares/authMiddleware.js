import { clerkClient } from "@clerk/express";

// Middleware ( Protect Educator Routes )

export const protectEducator = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== "educator")
      return res.json({
        success: false,
        message: "unauthorized Access",
      });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
  next();
};
