import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "rc-progress";
import { useAppConfig } from "../../context/AppContext";
import { useEnrollments } from "../../context/EnrollmentContext";
import { useAuth } from "../../context/AuthContext";
import {
  calculateCourseDuration,
  calculateNumOfLectures,
} from "../../utils/courseHelpers";
import Footer from "../../components/students/Footer";
import axios from "axios";
import { toast } from "react-toastify";
import EmptySection from "../../components/common/EmptySection";
import { assets } from "../../assets/assets";

function MyEnrollments() {
  const navigate = useNavigate();

  const { backendUrl } = useAppConfig();
  const { getToken, userData } = useAuth();
  const { enrolledCourses, refetchEnrollments } = useEnrollments();

  const [progressArray, setProgressArray] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          let totalLectures = calculateNumOfLectures(course);
          const progressData = data?.data?.progressData;
          const lectureCompleted = progressData?.lectureCompleted?.length || 0;
          return { lectureCompleted, totalLectures };
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (userData) {
      refetchEnrollments();
    }
  }, [userData, refetchEnrollments]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  return (
    <>
      <div className="px-8 md:px-36 pt-10 bg-gradient-to-b from-purple-100/70 via-pink-50/30 to-white mb-52">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>

        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-0">
                  <EmptySection
                    imageSrc={assets.cat_pana}
                    title="No Enrollments Yet"
                    actionLabel="Browse Courses"
                    onAction={() => navigate("/course-list")}
                  />
                </td>
              </tr>
            ) : (
              enrolledCourses.map((course, i) => {
                const isCompleted =
                  progressArray[i] &&
                  progressArray[i].lectureCompleted /
                    progressArray[i].totalLectures ===
                    1;
                return (
                  <tr key={i} className="border-b border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                      <img
                        src={course.courseThumbnail}
                        alt=""
                        className="w-14 sm:w-24 md:w-28"
                      />
                      <div className="flex-1">
                        <p className="mb-1 max-sm:text-sm">
                          {course.courseTitle}
                        </p>
                        <Line
                          strokeWidth={2}
                          percent={
                            progressArray[i]
                              ? (progressArray[i].lectureCompleted * 100) /
                                progressArray[i].totalLectures
                              : 0
                          }
                          className="bg-gray-300 rounded-full"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {calculateCourseDuration(course)}
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {progressArray[i] &&
                        `${progressArray[i].lectureCompleted} / ${progressArray[i].totalLectures}`}{" "}
                      <span>Lectures</span>
                    </td>
                    <td className="px-4 py-3 max-sm:text-right">
                      <button
                        className={`px-3 sm:px-5 py-1.5 sm:py-2 max-sm:text-xs text-white rounded-md ${
                          isCompleted
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-pink-600 hover:bg-pink-700"
                        }`}
                        onClick={() => navigate("/player/" + course._id)}
                      >
                        {isCompleted ? "Completed" : "On Going"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}

export default MyEnrollments;
