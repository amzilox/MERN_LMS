import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureId: { type: String, required: true },
  lectureTitle: { type: String, required: true },
  lectureDuration: { type: Number, required: true },
  lectureUrl: { type: String, required: true },
  videoSource: {
    type: String,
    enum: ["youtube", "cloudinary"],
    default: "youtube", // Default to youtube for backward compatibility
  },
  isPreviewFree: { type: Boolean, default: false },
  lectureOrder: { type: Number, required: true },
});

const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: { type: String, required: true },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    coursePrice: {
      type: Number,
      required: true,
    },
    courseThumbnail: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    courseContent: [chapterSchema],
    courseRatings: [
      { userId: { type: String }, rating: { type: Number, min: 1, max: 5 } },
    ],
    educator: { type: String, required: true, ref: "User" },
    enrolledStudents: [{ type: String, ref: "User" }],
  },
  { timestamps: true, minimize: false }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
