import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import { assets } from "../../assets/assets";
import YouTube from "react-youtube";
import { useCourseData } from "../../hooks/useCourseData";
import { calculateChapterTime } from "../../utils/courseHelpers";
import Loading from "../../components/students/Loading";
import Footer from "../../components/students/Footer";
import Rating from "../../components/students/Rating";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import VideoPlayer from "../../components/common/VideoPlayer";

function Player() {
  const { id } = useParams();
  const { courseData, handleRate, initRating } = useCourseData(id, "enrolled");
  const { getToken, backendUrl } = useAppContext();
  const [playerData, setPlayerData] = useState(null);
  const [openSections, setOpenSections] = useState(new Set());
  const [courseProgress, SetCourseProgress] = useState(null);
  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId: id, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.status === "success") {
        toast.success(data.message);
        getCourseProgress();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCourseProgress = useCallback(async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.status === "success") {
        SetCourseProgress(data.data.progressData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [getToken, backendUrl, id]);

  useEffect(() => {
    getCourseProgress();
  }, [getCourseProgress]);

  return courseData ? (
    <>
      <div className="flex flex-col-reverse p-4 sm:p-10 md:grid md:grid-cols-2 gap-10 md:px-36 bg-gradient-to-b from-purple-100/70 via-pink-50/30 to-white">
        {/* left column */}
        <div className="text-gray-800">
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
                            src={
                              courseProgress &&
                              courseProgress.lectureCompleted.includes(
                                lecture.lectureId
                              )
                                ? assets.green_check
                                : assets.play_icon
                            }
                            alt="play it"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
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
                                  Watch
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
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this Course:</h1>
            <Rating initialRating={initRating} onRate={handleRate} />
          </div>
        </div>

        {/* right column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <VideoPlayer
                lecture={playerData}
                onClose={() => setPlayerData(null)}
                showMarkComplete={true}
                onMarkComplete={markLectureAsCompleted}
                isCompleted={
                  courseProgress &&
                  courseProgress?.lectureCompleted?.includes(
                    playerData.lectureId
                  )
                }
              />
            </div>
          ) : (
            <img
              src={courseData ? courseData.courseThumbnail : ""}
              alt="Course illustration"
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
}

export default Player;
