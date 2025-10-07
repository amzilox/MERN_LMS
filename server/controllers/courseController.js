import Course from "../models/Course.js";

// Get All Courses:

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      isPublished: true,
    })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });

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

export const getCourseId = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate({
      path: "educator",
    });

    // Remove lectureUrl from response if isPreviewFree is false
    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
