import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/students/SearchBar";
import { useAppContext } from "../../context/AppContext";
import CourseCard from "../../components/students/CourseCard";
import { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import Footer from "../../components/students/Footer";

function CoursesList() {
  const navigate = useNavigate();
  const { query } = useParams();
  const { allCourses } = useAppContext();
  const [filteredCourses, setFilteredCourses] = useState(allCourses || []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      query
        ? setFilteredCourses(
            allCourses.filter((course) =>
              course.courseTitle.toLowerCase().includes(query.toLowerCase())
            )
          )
        : setFilteredCourses(allCourses);
    }
  }, [allCourses, query]);
  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">
        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
          <div className="">
            <h1 className="text-4xl font-semibold text-gray-800">
              Course List
            </h1>
            <p className="text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </span>{" "}
              / <span>Course List</span>
            </p>
          </div>
          <SearchBar data={query} />
        </div>
        {query && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600">
            <p>{query}</p>
            <img
              src={assets.cross_icon}
              alt=""
              className="cursor-pointer"
              onClick={() => navigate("/course-list")}
            />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:p-0">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CoursesList;
