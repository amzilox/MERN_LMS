import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";

// API Controller Func to Manage Clerk User with database

export const clerkwebhook = async (req, res) => {
  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await wh.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }

      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // Verify webhook signature to ensure it's genuinely from Stripe
    event = Stripe.webhooks.constructEvent(
      req.body, // Raw request body (must be raw, not parsed JSON)
      sig, // Stripe signature from headers
      process.env.STRIPE_WEBHOOK_SECRET // Secret from Stripe dashboard
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    // CASE 1: Payment successful and checkout completed
    case "checkout.session.completed": {
      try {
        const session = event.data.object;
        const { purchaseId, userId, courseId } = session.metadata;

        // Fetch all relevant data from database
        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        // Prevents crashes if metadata contains invalid IDs
        if (!purchaseData || !userData || !courseData) {
          console.error("Missing data:", { purchaseId, userId, courseId });
          return res.status(400).json({ error: "Invalid metadata" });
        }

        // This ensures a student isn't enrolled multiple times
        if (!courseData.enrolledStudents.includes(userId)) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
        }

        // Check if course already in user's enrollments
        if (!userData.enrolledCourses.includes(courseId)) {
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        purchaseData.status = "completed";
        await purchaseData.save();
      } catch (error) {
        // If any database operation fails, we catch and log it
        console.error("Checkout session error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      break;
    }

    // CASE 2: Payment failed
    case "payment_intent.payment_failed": {
      try {
        // Get the failed payment intent
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        // Prevents crash if no session found
        if (sessions.data.length === 0) {
          console.error(
            "No session found for payment intent:",
            paymentIntentId
          );
          break;
        }

        const session = sessions.data[0];
        const { purchaseId } = session.metadata;

        if (!purchaseId) {
          console.error("No purchaseId in metadata");
          break;
        }

        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          purchaseData.status = "failed";
          await purchaseData.save();
        }
      } catch (error) {
        console.error("Payment failed handler error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return success response
  res.status(200).json({ received: true });
};
