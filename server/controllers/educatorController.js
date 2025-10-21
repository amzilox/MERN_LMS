import fs from "fs";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";

export const updateRoleToEducator = async (req, res) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "educator" },
    });

    res.json({
      success: true,
      message: "You can now create and manage courses",
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Add New Course:
export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const { userId } = await req.auth();

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Thumbnail is required" });
    }

    let parsedCourseData;
    try {
      parsedCourseData = JSON.parse(courseData);
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course data format" });
    }

    parsedCourseData.educator = userId;
    parsedCourseData.isPublished = true;

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    parsedCourseData.courseThumbnail = imageUpload.secure_url;

    const newCourse = await Course.create(parsedCourseData);

    // remove temp file after successful upload/create
    if (imageFile.path) await fs.promises.unlink(imageFile.path);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload Video to Cloudinary
// export const uploadVideo = async (req, res) => {
//   try {
//     const videoFile = req.file;
//     const { userId } = await req.auth();

//     if (!userId) {
//       return res
//         .status(401)
//         .json({ success: false, message: "User not authenticated" });
//     }

//     if (!videoFile) {
//       return res.status(400).json({
//         success: false,
//         message: "No video file provided",
//       });
//     }

//     // (max 500MB)
//     const maxMb = +process.env.MAX_SIZE_MB;
//     if (videoFile.size > maxMb * 1024 * 1024) {
//       return res.status(400).json({
//         success: false,
//         message: `Video file too large. Maximum size is ${maxMb}MB`,
//       });
//     }

//     // Upload to Cloudinary with video-specific settings
//     const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
//       resource_type: "video",
//       folder: "course-videos",
//       format: "mp4", // Convert to MP4 for compatibility
//       transformation: [
//         { quality: "auto", fetch_format: "auto" }, // Optimize quality
//       ],
//     });

//     // Delete temp file
//     await fs.promises.unlink(videoFile.path);

//     res.status(200).json({
//       success: true,
//       message: "Video uploaded successfully",
//       videoUrl: videoUpload.secure_url,
//       duration: videoUpload.duration,
//       publicId: videoUpload.public_id,
//       uploadedBy: userId,
//     });
//   } catch (error) {
//     console.error("Video upload error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// Get Edu Courses:
export const getEducatorCourses = async (req, res) => {
  try {
    const { userId } = await req.auth();
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }
    const courses = await Course.find({ educator: userId });

    res.status(200).json({
      status: "success",
      resultsNum: courses.length,
      data: {
        courses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Courses)

export const educatorDashboardData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const courses = await Course.find({ educator: userId });
    // No. of Courses:
    const totalCourses = courses.length;

    // Total Earning:
    const courseIds = courses.map((course) => course._id);
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarnings = purchases.reduce((acc, purr) => acc + purr.amount, 0);

    // Enrolled Students: [ student: {name, imgUrl}, courseTitle ]
    const enrolledStudentsData = [];
    for (let course of courses) {
      const students = await User.find(
        {
          _id: { $in: course.enrolledStudents },
        },
        "name imageUrl"
      );
      for (let student of students) {
        enrolledStudentsData.push({
          student,
          courseTitle: course.courseTitle,
        });
      }
    }
    res.status(200).json({
      status: "success",
      data: {
        enrolledStudentsData,
        totalEarnings,
        totalCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Enrolled Students Data with Purchase Data:

export const getEnrolledStudentsData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const courses = await Course.find({ educator: userId });
    const courseIds = courses.map((course) => course._id);
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    })
      .populate("userId", "name imageUrl")
      .populate("courseId", "courseTitle");

    const enrolledStudents = purchases.map((purchase) => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseDate: purchase.createdAt,
    }));
    res.status(200).json({
      status: "success",
      resultsNum: enrolledStudents.length,
      data: {
        enrolledStudents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
