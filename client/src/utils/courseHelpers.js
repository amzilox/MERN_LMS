import humanizeDuration from "humanize-duration";

export function calculateRatings(course) {
  if (!course?.courseRatings?.length) {
    return 0;
  }
  const totalRating = course.courseRatings.reduce(
    (sum, rating) => sum + rating.rating,
    0
  );
  return +(totalRating / course.courseRatings.length).toFixed(1);
}

// Function to calculate course chapter time:
export const calculateChapterTime = (chapter) => {
  const totalSeconds = chapter.chapterContent.reduce(
    (total, lecture) => total + (lecture.lectureDuration || 0),
    0
  );
  return humanizeDuration(totalSeconds * 60 * 1000, {
    units: ["h", "m"],
    round: true,
  });
};

// Function to calculate course duration:
export const calculateCourseDuration = (course) => {
  const totalSeconds = course.courseContent.reduce((courseTotal, chapter) => {
    const chapterDuration = chapter.chapterContent.reduce(
      (chapterTotal, lecture) => chapterTotal + (lecture.lectureDuration || 0),
      0
    );
    return courseTotal + chapterDuration;
  }, 0);
  return humanizeDuration(totalSeconds * 60 * 1000, {
    units: ["h", "m"],
    round: true,
  });
};

// Function to calculate Num of Lectures in the course:
export const calculateNumOfLectures = (course) => {
  return course.courseContent.reduce(
    (total, chapter) => total + (chapter.chapterContent?.length || 0),
    0
  );
};
