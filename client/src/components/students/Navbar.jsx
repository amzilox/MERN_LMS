import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

function UserLinks() {
  const navigate = useNavigate();
  const { isEducator, setIsEducator, getToken, backendUrl } = useAppContext();

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
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
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <button onClick={becomeEducator}>
        {isEducator ? "Educator Dashboard" : "Become Educator"}
      </button>
      <span aria-hidden="true" className="mx-1">
        |
      </span>
      <Link to="/my-enrollments">My Enrollments</Link>
    </>
  );
}

function Navbar() {
  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");

  const { openSignIn } = useClerk();
  const { user } = useUser();
  return (
    <div
      className={`flex items-center justify-between px-4 ms:px-10 md:px-14 lg:px-36 border-b border-gray-200 py-4 ${
        isCourseListPage ? "bg-white" : "bg-purple-100/50"
      }`}
    >
      <Link to={"/"}>
        <img
          src={assets.logo}
          alt="Logo"
          className="w-28 lg:w-36 cursor-pointer"
        />
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">{user && <UserLinks />}</div>
        {user ? (
          <UserButton />
        ) : (
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
            onClick={() => openSignIn()}
          >
            Create Account
          </button>
        )}
      </div>
      {/* For Phone Screens */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs ">
          {user && <UserLinks />}
        </div>
        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()}>
            <img src={assets.user_icon} alt="Sign in / Create account" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
