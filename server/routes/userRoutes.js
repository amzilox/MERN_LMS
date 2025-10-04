import express from "express";
import {
  getUserData,
  purchaseCourse,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRouter = express.Router();

// Get User Data
userRouter.get("/profile", getUserData);

// Get Users Enrolled Courses
userRouter.get("/enrolled-courses", userEnrolledCourses);

// Purchase Course
userRouter.post("/purchase", purchaseCourse);

export default userRouter;
