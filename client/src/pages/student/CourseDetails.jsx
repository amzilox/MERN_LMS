import { useState } from "react";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { useAppContext } from "../../context/AppContext";

import { assets } from "../../assets/assets";
import Loading from "../../components/students/Loading";
import RatingStars from "../../components/common/RatingStars";
import {
  calculateRatings,
  calculateChapterTime,
  calculateCourseDuration,
  calculateNumOfLectures,
} from "../../utils/courseHelpers";
import Footer from "../../components/students/Footer";
import { useCourseData } from "../../hooks/useCourseData";
import { toast } from "react-toastify";
import axios from "axios";
import VideoPlayer from "../../components/common/VideoPlayer";

function CourseDetails() {
  const { id } = useParams();
  const { courseData } = useCourseData(id);
  const { getToken, userData, backendUrl, enrolledCourses } = useAppContext();
  const [openSections, setOpenSections] = useState(new Set());
  const [isAlreadyEnrolled, _] = useState(
    enrolledCourses?.some((course) => course._id === id)
  );
  const [playerData, setPlayerData] = useState(null);

  const { currency } = useAppContext();

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn("Login to Enroll");
      }
      if (isAlreadyEnrolled) {
        return toast.warn("Already Enrolled");
      }
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.status === "success") {
        const { session_url } = data.data;
        window.location.replace(session_url);
      } else {
        toast.error(data.messsage);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-purple-100/70 via-pink-50/30 to-white"></div>
        {/* left column */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-small"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 200),
            }}
          ></p>
          {/* review and ratings */}
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRatings(courseData)}</p>
            <RatingStars
              rating={calculateRatings(courseData)}
              parentStyles={"flex"}
              imgStyles={"w-3.5 h-3.5"}
            />
            <p className="text-blue-600">
              ({courseData.courseRatings.length}{" "}
              {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
            </p>
            <p>
              {courseData.enrolledStudents.length}{" "}
              {courseData.enrolledStudents.length > 1 ? "students" : "student"}
            </p>
          </div>

          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">
              {courseData.educator.name}
            </span>
          </p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => {
                return (
                  <div
                    key={index}
                    className="border border-gray-300 bg-white mb-2 rounded"
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                      onClick={() => toggleSection(index)}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={assets.down_arrow_icon}
                          alt="show more"
                          className={`transition-transform transform ${
                            openSections.has(index) ? "rotate-180" : ""
                          } `}
                        />
                        <p className="font-medium md:text-base text-sm">
                          {chapter.chapterTitle}
                        </p>
                      </div>
                      <p className="text-sm md:text-default">
                        {chapter.chapterContent?.length} lectures -{" "}
                        {calculateChapterTime(chapter)}
                      </p>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openSections.has(index) ? "max-h-96" : "max-h-0"
                      }`}
                    >
                      <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                        {chapter.chapterContent.map((lecture, i) => (
                          <li key={i} className="flex items-start gap-2 py-1">
                            <img
                              src={assets.play_icon}
                              alt="play it"
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                              <p>{lecture.lectureTitle}</p>
                              <div className="flex gap-2">
                                {lecture.isPreviewFree && (
                                  <p
                                    onClick={() =>
                                      setPlayerData({
                                        ...lecture,
                                        chapter: index + 1,
                                        lecture: i + 1,
                                      })
                                    }
                                    className="text-blue-500 cursor-pointer"
                                  >
                                    Preview
                                  </p>
                                )}
                                <p>
                                  {humanizeDuration(
                                    lecture.lectureDuration * 60 * 1000,
                                    ["h", "m"]
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription,
              }}
            ></p>
          </div>
        </div>
        {/* right column */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <VideoPlayer
              lecture={playerData}
              onClose={() => setPlayerData(null)}
              showMarkComplete={false} // For free-preview ? no need!
              isCompleted={false}
            />
          ) : (
            <div>
              <img
                className="w-full h-auto"
                src={courseData.courseThumbnail}
                alt="Course illustration"
              />
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                className="w-3.5"
                src={assets.time_left_clock_icon}
                alt="time left clock icon"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price!
              </p>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p className="">{calculateRatings(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p className="">{calculateCourseDuration(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="book icon" />
                <p className="">{calculateNumOfLectures(courseData)} lessons</p>
              </div>
            </div>
            <button
              className={`md:mt-6 mt-4 w-full py-3 rounded  ${
                isAlreadyEnrolled ? "bg-green-600" : "bg-pink-600"
              } text-white font-medium`}
              onClick={enrollCourse}
            >
              {isAlreadyEnrolled ? "Already Enrolled" : "Enrolled Now"}
            </button>
            <div className="pt-6">
              <p className="md:text-xl text-lg font-medium text-gray-800">
                What's in the course?
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access to all course materials.</li>
                <li>Certificate of completion.</li>
                <li>Downloadable resources and assignments.</li>
                <li>Access to instructor Q&amp;A and community.</li>
                <li>Regular course updates and new content.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
}

export default CourseDetails;
