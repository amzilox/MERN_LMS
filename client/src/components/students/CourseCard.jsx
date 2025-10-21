import { Link } from "react-router-dom";
import { useAppConfig } from "../../context/AppContext";
import { calculateRatings } from "../../utils/courseHelpers";
import RatingStars from "../common/RatingStars";

function CourseCard({ course }) {
  const { currency } = useAppConfig();

  return (
    <div className="relative group will-change-transform h-full">
      {/* Background gradient card - appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-lg transform translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out" />

      {/* Main card */}
      <Link
        to={`/course/${course._id}`}
        onClick={() => scrollTo(0, 0)}
        className="h-full relative flex flex-col border border-gray-200 pb-6 overflow-hidden rounded-lg bg-white transform transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-xl"
      >
        {/* Thumbnail */}
        <div className="overflow-hidden">
          <img
            src={course.courseThumbnail}
            alt={course.courseTitle}
            className="w-full aspect-[16/9] transition-transform duration-500 ease-out group-hover:scale-110"
          />
        </div>

        {/* Course details */}
        <div className="flex flex-col flex-1 p-3 text-left pt-5">
          <h3 className="text-base font-semibold text-gray-800 mb-1 group-hover:text-pink-600 transition-colors duration-200 line-clamp-2">
            {course.courseTitle}
          </h3>

          <p className="text-gray-500 text-sm mb-2">{course.educator.name}</p>

          <div className="flex-col justify-between mt-auto pt-2">
            {/* Rating line */}
            <div className="flex items-center space-x-2">
              <p className="font-medium text-sm">{calculateRatings(course)}</p>
              <RatingStars
                rating={calculateRatings(course)}
                parentStyles={"flex"}
                imgStyles={"w-3.5 h-3.5"}
              />
              <p className="text-gray-500 text-sm">
                ({course.courseRatings.length})
              </p>
            </div>

            <p className="text-lg font-bold text-gray-900">
              {currency}
              {(
                course.coursePrice -
                (course.coursePrice * course.discount) / 100
              ).toFixed(2)}
            </p>
          </div>
        </div>
        {/* Optional: "View" indicator on hover */}
        <span className="absolute right-4 bottom-4 text-pink-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          View →
        </span>
      </Link>
    </div>
  );
}

export default CourseCard;
