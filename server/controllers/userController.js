import Stripe from "stripe";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";
import CourseProgress from "../models/CourseProgress.js";

// Get User Data:
export const getUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Users Enrolled Courses with Lecture Links:
export const userEnrolledCourses = async (req, res) => {
  try {
    const { userId } = await req.auth();

    const userData = await User.findById(userId).populate("enrolledCourses");
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: {
        enrolledCourses: userData.enrolledCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    // Only for development purpose
    // In production, the browser will send the origin header
    const baseUrl = origin || `http://localhost:5173`;

    const { userId } = await req.auth();
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!courseData)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: +(
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    // Stripe Gateway Initialization
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const currency = process.env.CURRENCY.toLowerCase();

    // Create line items for stripe checkout session
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.round(newPurchase.amount) * 100, // in cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe Checkout Session
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${baseUrl}/loading/my-enrollements`,
      cancel_url: `${baseUrl}/`,
      line_items,
      mode: "payment",
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId: userId.toString(),
        courseId: courseId.toString(),
      },
      payment_intent_data: {
        metadata: {
          purchaseId: newPurchase._id.toString(),
          userId: userId.toString(),
          courseId: courseId.toString(),
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        session_url: session.url,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Stripe purchase error:", error);
  }
};

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId, lectureId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.status(200).json({
          status: "success",
          message: "Lecture already marked as completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.status(200).json({
      status: "success",
      message: "Lecture marked as completed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Update course progress error:", error);
  }
};

// Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });
    res.status(200).json({
      status: "success",
      data: {
        progressData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Get course progress error:", error);
  }
};

// Add User Rating to Course

export const addUserRating = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { courseId, rating } = req.body;
    if (!courseId || !rating || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(404).json({
        success: false,
        message: "User has not purchased this course.",
      });
    }
    const existingRatingIndex = courseData.courseRatings.findIndex(
      (rating) => rating.userId.toString() === userId.toString()
    );
    if (existingRatingIndex !== -1) {
      courseData.courseRatings[existingRatingIndex].rating = rating;
    } else {
      courseData.courseRatings.push({ userId, rating });
    }
    await courseData.save();
    res.status(200).json({
      status: "success",
      message: "Rating added/updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Add user rating error:", error);
  }
};
