import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export const useCourseData = (courseId, source = "all_courses") => {
  const { allCourses, enrolledCourses } = useAppContext();
  const [courseData, setCourseData] = useState(null);

  useEffect(() => {
    const coursesArray = source === "enrolled" ? enrolledCourses : allCourses;
    if (coursesArray && coursesArray.length > 0 && courseId) {
      const course = coursesArray.find((course) => course._id === courseId);
      setCourseData(course || null);
    }
  }, [courseId, allCourses, enrolledCourses, source]);
  return { courseData };
};
