import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { useCourses } from "../../context/CourseContext";

function CoursesSection() {
  const { allCourses } = useCourses();
  return (
    <div className="py-16 md:px-20 px-8 w-3/4">
      <h2 className="text-3xl font-medium text-gray-800">
        Level Up Your Skills with the Experts
      </h2>
      <p className="text-sm md:text-base text-gray-500 mt-3">
        Discover hands-on courses that combine theory and real-world practice.
        Whether you're coding, creating, <br />
        or building your dream career — start learning smarter today.
      </p>

      <div className="grid grid-cols-auto px-4 md:px-0 md:my-16 my-10 gap-4 auto-rows-fr">
        {allCourses?.slice(0, 4).map((course, i) => {
          return <CourseCard course={course} key={i} />;
        })}
      </div>

      <Link
        to={"/course-list"}
        className="px-10 py-3 rounded-md text-white bg-pink-600/70 hover:bg-pink-600/90"
      >
        Show all courses
      </Link>
    </div>
  );
}

export default CoursesSection;
