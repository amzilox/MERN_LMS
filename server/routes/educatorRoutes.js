import express from "express";
import {
  addCourse,
  educatorDashboardData,
  getEducatorCourses,
  getEnrolledStudentsData,
  updateRoleToEducator,
  uploadVideo,
} from "../controllers/educatorController.js";
import upload from "../configs/multer.js";
import { protectEducator } from "../middlewares/authMiddleware.js";

const educatorRouter = express.Router();

// Add Educator Role to User
educatorRouter.get("/update-role", updateRoleToEducator);

// Add New Course
educatorRouter.post(
  "/add-course",
  protectEducator,
  upload.single("image"),
  addCourse
);

// Video upload
educatorRouter.post("/upload-video", upload.single("video"), uploadVideo);

// Get All Courses for Educator
educatorRouter.get("/courses", protectEducator, getEducatorCourses);

// Get Educator Dashboard Data
educatorRouter.get("/dashboard", protectEducator, educatorDashboardData);

// Get Enrolled Students Data with Purchase Data
educatorRouter.get(
  "/enrolled-students",
  protectEducator,
  getEnrolledStudentsData
);

export default educatorRouter;
