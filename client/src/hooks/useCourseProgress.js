import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const useCourseProgress = (courseId, backendUrl, getToken) => {
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.status === "success") {
        setCourseProgress(data.data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      toast.error("Failed to load course progress");
    } finally {
      setLoading(false);
    }
  }, [courseId, backendUrl, getToken]);

  const markLectureCompleted = useCallback(
    async (lectureId) => {
      try {
        const token = await getToken();
        const { data } = await axios.post(
          `${backendUrl}/api/user/update-course-progress`,
          { courseId, lectureId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.status === "success") {
          toast.success(data.message);
          await fetchProgress(); // Refresh progress
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Failed to mark lecture:", error);
        toast.error("Failed to mark lecture as completed");
      }
    },
    [courseId, backendUrl, getToken, fetchProgress]
  );

  return {
    courseProgress,
    loading,
    fetchProgress,
    markLectureCompleted,
  };
};
