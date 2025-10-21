/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";

const EnrollmentContext = createContext();

export const EnrollmentProvider = ({ children }) => {
  const { getToken } = useClerkAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEnrolledCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) return;
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.status === "success") {
        setEnrolledCourses(data.data.enrolledCourses.reverse());
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch enrollments:", error);
      toast.error("Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, getToken]);

  useEffect(() => {
    // Only fetch if user is authenticated
    const token = getToken();
    if (token) {
      fetchEnrolledCourses();
    }
  }, [getToken]);

  const value = {
    enrolledCourses,
    loading,
    refetchEnrollments: fetchEnrolledCourses,
  };

  return (
    <EnrollmentContext.Provider value={value}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollments = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollments must be used within EnrollmentProvider");
  }
  return context;
};
