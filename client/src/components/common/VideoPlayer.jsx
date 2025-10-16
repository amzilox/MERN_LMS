import YouTube from "react-youtube";
import { extractYouTubeId } from "../../utils/VideoHelpers";

const VideoPlayer = ({
  lecture,
  onClose,
  showMarkComplete,
  onMarkComplete,
  isCompleted,
}) => {
  const renderPlayer = () => {
    console.log(lecture);
    if (!lecture || !lecture.lectureUrl) {
      return (
        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">No video available</p>
        </div>
      );
    }

    // Default to youtube if videoSource is missing (backward compatibility)
    const videoSource = lecture.videoSource || "youtube";

    // YouTube video
    if (videoSource === "youtube") {
      const videoId = extractYouTubeId(lecture.lectureUrl);
      console.log(videoId);
      return (
        <YouTube
          videoId={videoId}
          opts={{
            playerVars: {
              autoplay: 1,
              rel: 0,
              modestbranding: 1,
            },
          }}
          iframeClassName="w-full aspect-video rounded-lg"
        />
      );
    }

    // Cloudinary or direct video URL
    if (videoSource === "cloudinary" || videoSource === "direct") {
      return (
        <video
          className="w-full aspect-video rounded-lg bg-black"
          controls
          controlsList="nodownload"
          src={lecture.lectureUrl}
          autoPlay
        >
          <source src={lecture.lectureUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Fallback
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Unsupported video format</p>
      </div>
    );
  };

  return (
    <div>
      {renderPlayer()}

      {/* Lecture Info & Controls */}
      {lecture && (
        <div className="flex justify-between items-center mt-2 md:mt-4 p-2 md:p-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="font-medium text-gray-800 truncate">
              {lecture.chapter}.{lecture.lecture} {lecture.lectureTitle}
            </p>
            {lecture.lectureDuration && (
              <p className="text-sm text-gray-500">
                Duration: {lecture.lectureDuration} minutes
              </p>
            )}
          </div>

          {/* Mark Complete Button */}
          {showMarkComplete && (
            <button
              onClick={() => onMarkComplete(lecture.lectureId)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                isCompleted
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {isCompleted ? "✓ Completed" : "Mark Complete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
