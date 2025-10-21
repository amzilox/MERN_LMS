/* eslint-disable react-refresh/only-export-components */
import { useAuth as useAuthentication, useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { getToken } = useAuthentication();
  const { user } = useUser();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userData, setUserData] = useState(null);
  const [isEducator, setIsEducator] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch User Data:
  const fetchUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Check role from Clerk metadata:
    if (user?.publicMetadata?.role === "educator") {
      setIsEducator(true);
    }

    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.status === "success") {
        setUserData(data.data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, [getToken, user, backendUrl]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const value = {
    user,
    userData,
    setUserData,
    isEducator,
    setIsEducator,
    getToken,
    loading,
    refetchUserData: fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
