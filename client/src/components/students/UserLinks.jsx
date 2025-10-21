import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useAppConfig } from "../../context/AppContext";

const UserLinks = () => {
  const navigate = useNavigate();
  const { isEducator, setIsEducator, getToken } = useAuth();
  const { backendUrl } = useAppConfig();
  const [isBecomingEducator, setIsBecomingEducator] = useState(false);

  const handleBecomeEducator = async () => {
    // If already educator, just navigate
    if (isEducator) {
      navigate("/educator");
      return;
    }

    setIsBecomingEducator(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/update-role`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.success) {
        setIsEducator(true);
        toast.success(data.message);
        navigate("/educator");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error becoming educator:", error);
      toast.error(error.message);
    } finally {
      setIsBecomingEducator(false);
    }
  };

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={handleBecomeEducator}
          disabled={isBecomingEducator}
          className={`group relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 disabled:opacity-50 ${
            isEducator
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-0.5"
              : "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white hover:shadow-md"
          }`}
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isEducator ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              )}
            </svg>
            <span>
              {isBecomingEducator
                ? "Loading..."
                : isEducator
                ? "Dashboard"
                : "Become Educator"}
            </span>
          </span>
        </button>

        <span className="h-6 w-px bg-gray-300"></span>

        <Link
          to="/my-enrollments"
          className="group relative px-4 py-2 rounded-lg font-medium text-sm text-gray-700 hover:text-purple-600 transition-all duration-300 hover:bg-purple-50"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            My Enrollments
          </span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={handleBecomeEducator}
          disabled={isBecomingEducator}
          className={`p-2 rounded-lg transition-all duration-300 disabled:opacity-50 ${
            isEducator
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
              : "border border-purple-600 text-purple-600"
          }`}
          title={isEducator ? "Educator Dashboard" : "Become Educator"}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isEducator ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            )}
          </svg>
        </button>

        <Link
          to="/my-enrollments"
          className="p-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
          title="My Enrollments"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </Link>
      </div>
    </>
  );
};

export default UserLinks;
