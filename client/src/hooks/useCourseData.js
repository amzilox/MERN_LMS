import { useEffect, useCallback, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

export const useCourseData = (courseId, source = "all_courses") => {
  const { backendUrl, enrolledCourses, userData, getToken } = useAppContext();
  const [courseData, setCourseData] = useState(null);
  const [initRating, setInitRating] = useState(0);

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.status === "success") {
        toast.success(data.message);
        fetchCourseData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCourseData = useCallback(async () => {
    try {
      // 1/ If source is 'enrolled', use data from context:
      if (source === "enrolled") {
        const course = enrolledCourses.find(
          (course) => course._id === courseId
        );
        if (course) {
          setCourseData(course);
          const userRating = course.courseRatings.find(
            (rating) => rating.userId === userData._id
          );
          if (userRating) {
            setInitRating(userRating.rating);
          }
          return; // Blaa man7taaj backend data ✅;
        }
      }

      // 2/ Otherwise, 9elleeb ela data mn server:
      const { data } = await axios.get(`${backendUrl}/api/courses/${courseId}`);

      if (data.success) {
        setCourseData(data.data.course);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [source, enrolledCourses, courseId, backendUrl]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);
  return { initRating, handleRate, courseData };
};
