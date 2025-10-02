import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { calculateRatings } from "../../utils/courseHelpers";
import RatingStars from "../common/RatingStars";

function CourseCard({ course }) {
  const { currency } = useAppContext();
  return (
    <Link
      to={`/course/${course._id}`}
      onClick={() => scrollTo(0, 0)}
      className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg"
    >
      <img src={course.courseThumbnail} alt="" className="w-full" />
      <div className="p-3 text-left">
        <h3 className="text-base font-semibold">{course.courseTitle}</h3>
        <p className="text-gray-500">AmzilOx</p>
        <div className="flex items-center space-x-2">
          <p>{calculateRatings(course)}</p>
          <RatingStars
            rating={calculateRatings(course)}
            parentStyles={"flex"}
            imgStyles={"w-3.5 h-3.5"}
          />
          <p className="text-gray-500">{course.courseRatings.length}</p>
        </div>
        <p className="text-base font-semibold text-gray-800">
          {currency}
          {(
            course.coursePrice -
            (course.coursePrice * course.discount) / 100
          ).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}

export default CourseCard;
