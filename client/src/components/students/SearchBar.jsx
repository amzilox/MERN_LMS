import { useLocation, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useEffect, useState } from "react";

function SearchBar({ data }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState(data ? data : "");

  // Reset input when URL changes (when data prop changes)
  useEffect(() => {
    setInput(data || "");
  }, [data]);

  useEffect(() => {
    if (location.pathname.startsWith("/course-list")) {
      const timer = setTimeout(() => {
        if (input.trim()) {
          navigate(`/course-list/${input}`);
        } else {
          navigate("/course-list");
        }
      }, 300); // Wait 300ms after user stops typing

      return () => clearTimeout(timer);
    }
  }, [input, navigate, location.pathname]);

  const onSearchHandler = (e) => {
    e.preventDefault();
    navigate(`/course-list/${input}`);
  };

  return (
    <form
      onSubmit={(e) => onSearchHandler(e)}
      className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded"
    >
      <img
        src={assets.search_icon}
        alt="search_icon"
        className="md:w-auto w-10 px-3"
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for courses"
        className="w-full h-full outline-none text-gray-500/80"
      />
      <button
        type="submit"
        className="bg-blue-600 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
