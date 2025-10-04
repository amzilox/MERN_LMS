import Stripe from "stripe";
import Course from "../models/Course.js";
import Purchase from "../models/Purchase.js";
import User from "../models/User.js";

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
      success_url: `${baseUrl}/loading?my-enrollements`,
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
