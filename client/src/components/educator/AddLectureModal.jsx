import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { assets } from "../../assets/assets";
import { isValidYouTubeUrl } from "../../utils/VideoHelpers";

const AddLectureModal = ({ isOpen, onClose, onAddLecture }) => {
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    videoSource: "youtube",
    isPreviewFree: false,
  });

  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleAddLecture = async () => {
    try {
      // Validation
      if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration) {
        toast.error("Please fill in all required fields");
        return;
      }

      // YouTube validation
      if (lectureDetails.videoSource === "youtube") {
        if (!lectureDetails.lectureUrl) {
          toast.error("Please provide a YouTube URL");
          return;
        }
        if (!isValidYouTubeUrl(lectureDetails.lectureUrl)) {
          toast.error("Invalid YouTube URL");
          return;
        }
      }

      // Cloudinary validation
      if (lectureDetails.videoSource === "cloudinary" && !videoFile) {
        toast.error("Please select a video file");
        return;
      }

      let finalLectureUrl = lectureDetails.lectureUrl;

      // Handle Cloudinary upload
      if (lectureDetails.videoSource === "cloudinary" && videoFile) {
        setUploadingVideo(true);
        setUploadProgress(0);

        try {
          const formData = new FormData();
          formData.append("file", videoFile);
          formData.append("upload_preset", uploadPreset);
          formData.append("resource_type", "video");
          formData.append("folder", "courses/videos");

          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
            formData,
            {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            }
          );

          if (response.data.secure_url) {
            finalLectureUrl = response.data.secure_url;
            toast.success("Video uploaded successfully!");
          } else {
            throw new Error("Upload failed");
          }
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(
            error.response?.data?.error?.message || "Failed to upload video"
          );
          setUploadingVideo(false);
          setUploadProgress(0);
          return;
        }
      }

      // Create lecture object
      const newLecture = {
        lectureTitle: lectureDetails.lectureTitle,
        lectureDuration: lectureDetails.lectureDuration,
        lectureUrl: finalLectureUrl,
        videoSource: lectureDetails.videoSource,
        isPreviewFree: lectureDetails.isPreviewFree,
      };

      // Call parent callback
      onAddLecture(newLecture);

      // Reset and close
      resetModal();
    } catch (error) {
      console.error("Error adding lecture:", error);
      toast.error("Failed to add lecture");
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      videoSource: "youtube",
      isPreviewFree: false,
    });
    setVideoFile(null);
    setUploadingVideo(false);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white text-gray-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl font-bold text-gray-800">Add Lecture</h2>
          <button
            onClick={resetModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploadingVideo}
          >
            <img src={assets.cross_icon} alt="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Lecture Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title *
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="e.g., Introduction to React Hooks"
              value={lectureDetails.lectureTitle}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureTitle: e.target.value,
                })
              }
              disabled={uploadingVideo}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="e.g., 15"
              value={lectureDetails.lectureDuration}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureDuration: e.target.value,
                })
              }
              disabled={uploadingVideo}
            />
          </div>

          {/* Video Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Source *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setLectureDetails({
                    ...lectureDetails,
                    videoSource: "youtube",
                    lectureUrl: "",
                  });
                  setVideoFile(null);
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  lectureDetails.videoSource === "youtube"
                    ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={uploadingVideo}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📺</span>
                  <span className="font-medium text-sm">YouTube</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLectureDetails({
                    ...lectureDetails,
                    videoSource: "cloudinary",
                    lectureUrl: "",
                  });
                  setVideoFile(null);
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  lectureDetails.videoSource === "cloudinary"
                    ? "border-purple-600 bg-purple-50 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={uploadingVideo}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">☁️</span>
                  <span className="font-medium text-sm">Upload</span>
                </div>
              </button>
            </div>
          </div>

          {/* YouTube URL Input */}
          {lectureDetails.videoSource === "youtube" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video URL *
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-4 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
                value={lectureDetails.lectureUrl}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    lectureUrl: e.target.value,
                  })
                }
                disabled={uploadingVideo}
              />
            </div>
          )}

          {/* Cloudinary Upload */}
          {lectureDetails.videoSource === "cloudinary" && (
            <div className="space-y-3">
              {!videoFile && !uploadingVideo && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    id="videoUpload"
                    accept="video/mp4,video/webm,video/ogg"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 500 * 1024 * 1024) {
                          toast.error("Video must be less than 500MB");
                          return;
                        }
                        setVideoFile(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="videoUpload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-3xl">📤</span>
                    </div>
                    <span className="font-medium text-gray-700">
                      Click to upload video
                    </span>
                    <span className="text-xs text-gray-500">
                      MP4, WebM (max 500MB)
                    </span>
                  </label>
                </div>
              )}

              {videoFile && !uploadingVideo && (
                <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center">
                      <span className="text-white">🎥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {videoFile.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <img
                        src={assets.cross_icon}
                        className="w-4 h-4"
                        alt="remove"
                      />
                    </button>
                  </div>
                </div>
              )}

              {uploadingVideo && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      Uploading...
                    </span>
                    <span className="text-purple-600 font-semibold">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Free Preview Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Free Preview</p>
              <p className="text-sm text-gray-500">
                Allow non-enrolled students to watch
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: e.target.checked,
                  })
                }
                disabled={uploadingVideo}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
          <button
            onClick={resetModal}
            type="button"
            disabled={uploadingVideo}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAddLecture}
            type="button"
            disabled={
              uploadingVideo ||
              !lectureDetails.lectureTitle ||
              !lectureDetails.lectureDuration ||
              (lectureDetails.videoSource === "youtube" &&
                !lectureDetails.lectureUrl) ||
              (lectureDetails.videoSource === "cloudinary" && !videoFile)
            }
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {uploadingVideo ? "Uploading..." : "Add Lecture"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLectureModal;
