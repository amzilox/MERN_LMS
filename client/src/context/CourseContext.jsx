/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.get(`${backendUrl}/api/courses/all`);

      if (data?.status === "success") {
        setAllCourses(data.data.courses);
      } else {
        throw new Error(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError(error.message);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const value = {
    allCourses,
    loading,
    error,
    refetchCourses: fetchAllCourses,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within CourseProvider");
  }
  return context;
};
