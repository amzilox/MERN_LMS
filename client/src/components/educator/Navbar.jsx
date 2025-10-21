import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

function Navbar() {
  const { user } = useUser();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 py-4">
        {/* Logo */}
        <Link to="/" className="transition-opacity hover:opacity-80">
          <img src={assets.logo} alt="Logo" className="w-28 lg:w-32" />
        </Link>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {/* Greeting Badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Hi,{" "}
                <span className="text-purple-600">
                  {user.firstName || user.fullName?.split(" ")[0] || "Teacher"}
                </span>
              </span>
            </div>
          )}

          {/* User Avatar */}
          {user ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-10 h-10 ring-2 ring-purple-100 hover:ring-purple-300 transition-all",
                },
              }}
            />
          ) : (
            <img
              className="w-10 h-10 rounded-full ring-2 ring-gray-200 hover:ring-purple-300 transition-all"
              src={assets.profile_img}
              alt="Profile"
            />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
