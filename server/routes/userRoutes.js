import express from "express";
import {
  addUserRating,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserCourseProgress,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Get User Data
userRouter.get("/profile", getUserData);

// Get Users Enrolled Courses
userRouter.get("/enrolled-courses", userEnrolledCourses);

// Purchase Course
userRouter.post("/purchase", purchaseCourse);

// Update Course Progress
userRouter.post("update-course-progress", updateUserCourseProgress);

// Get Course Progress
userRouter.post("get-course-progress", getUserCourseProgress);

// Add Rating to Course
userRouter.post("/add-rating", addUserRating);
export default userRouter;
