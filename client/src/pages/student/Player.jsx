import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import humanizeDuration from "humanize-duration";

import { assets } from "../../assets/assets";
import { useCourseData } from "../../hooks/useCourseData";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { calculateChapterTime } from "../../utils/courseHelpers";
import { useAuth } from "../../context/AuthContext";
import { useAppConfig } from "../../context/AppContext";

import Loading from "../../components/students/Loading";
import Footer from "../../components/students/Footer";
import Rating from "../../components/students/Rating";
import VideoPlayer from "../../components/common/VideoPlayer";

function Player() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { backendUrl } = useAppConfig();

  // Course data
  const { courseData, handleRate, initRating } = useCourseData(id, "enrolled");

  // Course progress
  const { courseProgress, fetchProgress, markLectureCompleted } =
    useCourseProgress(id, backendUrl, getToken);

  // UI state
  const [playerData, setPlayerData] = useState(null);
  const [openSections, setOpenSections] = useState(new Set());

  // Fetch progress on mount
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const handlePlayLecture = (lecture, chapterIndex, lectureIndex) => {
    setPlayerData({
      ...lecture,
      chapter: chapterIndex + 1,
      lecture: lectureIndex + 1,
    });
  };

  if (!courseData) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col-reverse p-4 sm:p-10 md:grid md:grid-cols-2 gap-10 md:px-36 bg-gradient-to-b from-purple-100/70 via-pink-50/30 to-white">
        {/* Left Column - Course Structure */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold mb-5">Course Structure</h2>

          <div className="space-y-2">
            {courseData.courseContent.map((chapter, chapterIndex) => (
              <div
                key={chapterIndex}
                className="border border-gray-300 bg-white rounded"
              >
                {/* Chapter Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(chapterIndex)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={assets.down_arrow_icon}
                      alt="toggle"
                      className={`transition-transform ${
                        openSections.has(chapterIndex) ? "rotate-180" : ""
                      }`}
                    />
                    <p className="font-medium md:text-base text-sm">
                      {chapter.chapterTitle}
                    </p>
                  </div>
                  <p className="text-sm md:text-base text-gray-500">
                    {chapter.chapterContent?.length} lectures ·{" "}
                    {calculateChapterTime(chapter)}
                  </p>
                </div>

                {/* Chapter Lectures */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openSections.has(chapterIndex) ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <ul className="border-t border-gray-300 divide-y divide-gray-100">
                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                      <li
                        key={lectureIndex}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <img
                            src={
                              courseProgress?.lectureCompleted.includes(
                                lecture.lectureId
                              )
                                ? assets.green_check
                                : assets.play_icon
                            }
                            alt="status"
                            className="w-4 h-4 mt-1 flex-shrink-0"
                          />

                          {/* Lecture Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm md:text-base text-gray-800 truncate">
                                {lecture.lectureTitle}
                              </p>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {lecture.lectureUrl && (
                                  <button
                                    onClick={() =>
                                      handlePlayLecture(
                                        lecture,
                                        chapterIndex,
                                        lectureIndex
                                      )
                                    }
                                    className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                                  >
                                    Watch
                                  </button>
                                )}
                                <span className="text-sm text-gray-500">
                                  {humanizeDuration(
                                    lecture.lectureDuration * 60 * 1000,
                                    ["h", "m"]
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Rating Section */}
          <div className="flex items-center gap-3 py-6 mt-10 border-t">
            <h3 className="text-lg font-bold text-gray-800">
              Rate this Course:
            </h3>
            <Rating initialRating={initRating} onRate={handleRate} />
          </div>
        </div>

        {/* Right Column - Video Player */}
        <div className="md:mt-10">
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={courseData.courseThumbnail}
              alt="Course thumbnail"
              className="w-full h-auto"
            />
            <div className="p-6 bg-white">
              <p className="text-center text-gray-600">
                Select a lecture to start watching
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {playerData && (
        <VideoPlayer
          lecture={playerData}
          onClose={() => setPlayerData(null)}
          showMarkComplete={true}
          onMarkComplete={markLectureCompleted}
          isCompleted={courseProgress?.lectureCompleted?.includes(
            playerData.lectureId
          )}
        />
      )}
      <Footer />
    </>
  );
}

export default Player;
