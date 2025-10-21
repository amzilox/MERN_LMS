import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { assets } from "../../assets/assets";
import UserLinks from "./UserLinks";

function Navbar() {
  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");
  const { openSignIn } = useClerk();
  const { user } = useUser();

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-200 py-4 backdrop-blur-sm transition-colors duration-300 ${
        isCourseListPage ? "bg-white/95" : "bg-purple-50/95"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="transition-opacity hover:opacity-80">
        <img src={assets.logo} alt="Mindure Logo" className="w-28 lg:w-36" />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {user && <UserLinks />}

        {user ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-10 h-10 ring-2 ring-purple-200 hover:ring-purple-400 transition-all",
              },
            }}
          />
        ) : (
          <button
            className="group relative bg-gradient-to-l from-pink-400 to-purple-400 
hover:from-pink-500 hover:to-purple-500 
text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 
shadow-md hover:shadow-lg hover:shadow-pink-400/40 hover:-translate-y-0.5"
            onClick={() => openSignIn()}
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Get Started
            </span>
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-3 text-gray-700">
        {user && <UserLinks />}

        {user ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-purple-200",
              },
            }}
          />
        ) : (
          <button
            onClick={() => openSignIn()}
            className="p-2 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-md"
          >
            <img
              src={assets.user_icon}
              alt="Sign in"
              className="w-5 h-5 brightness-0 invert"
            />
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
