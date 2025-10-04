/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { dummyCourses } from "../assets/assets";

const AppContext = createContext();

const AppContextProvider = (props) => {
  const { getToken } = useAuth();
  const { user } = useUser();

  const currency = import.meta.env.VITE_CURRENCY;

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);

  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch User Enrolled Courses
  const fetchUserEnrolledCourses = async () => {
    setEnrolledCourses(dummyCourses);
  };

  // Load courses when component mounts
  useEffect(() => {
    const fetchAllCourses = () => {
      setAllCourses(dummyCourses);
    };
    fetchAllCourses();
    fetchUserEnrolledCourses();
  }, []);

  useEffect(() => {
    const fetchUserToken = async () => {
      if (user) {
        const token = await getToken();
        console.log(token);
      }
      return null;
    };
    fetchUserToken();
  }, [user, getToken]);

  const value = {
    currency,
    allCourses,
    isEducator,
    setIsEducator,
    enrolledCourses,
    fetchUserEnrolledCourses,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};

export { AppContext, AppContextProvider, useAppContext };
