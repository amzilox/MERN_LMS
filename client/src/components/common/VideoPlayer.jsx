import YouTube from "react-youtube";
import { extractYouTubeId } from "../../utils/VideoHelpers";
import { useEffect } from "react";
import { assets } from "../../assets/assets";

const VideoPlayer = ({
  lecture,
  onClose,
  showMarkComplete,
  onMarkComplete,
  isCompleted,
}) => {
  const renderPlayer = () => {
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

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Close on background click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 ">
          <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">
            {lecture.lectureTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <img
              src={assets.cross_icon}
              alt="hide"
              className="cursor-pointer w-4 h-4"
            />
          </button>
        </div>

        <div className="relative bg-black">{renderPlayer()}</div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Duration: {lecture.lectureDuration} minutes
            </p>
            {showMarkComplete && !isCompleted && (
              <button
                onClick={() => onMarkComplete(lecture.lectureId)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Mark as Complete
              </button>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
