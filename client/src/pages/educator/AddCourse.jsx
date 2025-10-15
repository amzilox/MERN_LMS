import uniqid from "uniqid";
import Quill from "quill";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import EduPopup from "../../components/educator/EduPopup";

function AddCourse() {
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [discount, setDiscount] = useState();
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [eduPopupOpen, setEduPopupOpen] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    videoSource: "youtube", // youtube || cloudinary
    isPreviewFree: false,
  });

  // For video file uploads
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { getToken, backendUrl } = useAppContext();

  const handleTitleSubmit = (title) => {
    if (title) {
      const newChapter = {
        chapterId: uniqid(),
        chapterTitle: title,
        chapterContent: [],
        collapsed: false,
        chapterOrder:
          chapters.length > 0
            ? chapters[chapters.length - 1].chapterOrder + 1
            : 1,
      };
      setChapters([...chapters, newChapter]);
    }
    setEduPopupOpen(false);
  };
  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      setEduPopupOpen(true);
    } else if (action === "remove") {
      setChapters(
        chapters.filter((chapter) => chapter.chapterId !== chapterId)
      );
    } else if (action === "toggle") {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            const updatedContent = chapter.chapterContent.filter(
              (_, index) => index !== lectureIndex
            );
            return { ...chapter, chapterContent: updatedContent };
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = async () => {
    try {
      // Validation
      if (!lectureDetails.lectureTitle || !lectureDetails.lectureDuration) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (
        lectureDetails.videoSource === "youtube" &&
        !lectureDetails.lectureUrl
      ) {
        toast.error("Please provide a YouTube URL");
        return;
      }

      if (lectureDetails.videoSource === "cloudinary" && !videoFile) {
        toast.error("Please select a video file");
        return;
      }

      let finalLectureUrl = lectureDetails.lectureUrl;

      // Handle Cloudinary Upload
      if (lectureDetails.videoSource === "cloudinary" && videoFile) {
        setUploadingVideo(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("video", videoFile);

        try {
          const token = await getToken();

          // Upload video with progress tracking
          const { data } = await axios.post(
            `${backendUrl}/api/educator/upload-video`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(percentCompleted);
              },
            }
          );

          if (data.success) {
            finalLectureUrl = data.videoUrl;
            toast.success("Video uploaded successfully!");
          } else {
            throw new Error(data.message || "Upload failed");
          }
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(
            error.response?.data?.message || "Failed to upload video"
          );
          setUploadingVideo(false);
          setUploadProgress(0);
          return;
        }
      }

      // Add lecture to chapter
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === currentChapterId) {
            const newLecture = {
              lectureTitle: lectureDetails.lectureTitle,
              lectureDuration: lectureDetails.lectureDuration,
              lectureUrl: finalLectureUrl,
              videoSource: lectureDetails.videoSource,
              isPreviewFree: lectureDetails.isPreviewFree,
              lectureOrder:
                chapter.chapterContent.length > 0
                  ? chapter.chapterContent[chapter.chapterContent.length - 1]
                      .lectureOrder + 1
                  : 1,
              lectureId: uniqid(),
            };
            chapter.chapterContent.push(newLecture);
          }
          return chapter;
        })
      );

      // Reset state
      setShowPopup(false);
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

      toast.success("Lecture added successfully!");
    } catch (error) {
      console.error("Error adding lecture:", error);
      toast.error("Failed to add lecture");
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!image) {
        toast.error("Thumbnail Not Selected");
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("image", image);

      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setCoursePrice("");
        setCourseTitle("");
        setDiscount("");
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  return (
    <div className="h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 px-4 pt-8 pb-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md w-full text-gray-500"
      >
        <div className="flex flex-col gap-1">
          <p>Course Title</p>
          <input
            type="text"
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            placeholder="Type here..."
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <p>Course Description</p>
          <div className="" ref={editorRef}></div>
        </div>

        <div className="flex items-center justify-between flex-wrap">
          <div className="flex flex-col gap-1">
            <p>Course Price</p>
            <input
              type="number"
              placeholder="0"
              onChange={(e) => setCoursePrice(+e.target.value)}
              value={coursePrice}
              required
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            />
          </div>

          <div className="flex md:flex-row flex-col items-center gap-3">
            <p>Course Thumbnail</p>
            <label htmlFor="thumbnailImage" className="flex items-center gap-3">
              <img
                src={assets.file_upload_icon}
                alt="upload_image"
                className="p-3 bg-blue-500 rounded"
              />

              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="thumbnailImage"
                accept="image/*"
                hidden
              />
              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt="thumbnail_image"
                  className="max-h-10"
                />
              )}
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p>Discount %</p>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(+e.target.value)}
            placeholder="0"
            min={0}
            max={100}
            className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            required
          />
        </div>
        {/* Adding Chapters & Lectures */}

        <div className="">
          {chapters.map((chapter, index) => (
            <div key={index} className="bg_white border rounded-lg mb-4">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center">
                  <img
                    onClick={() => handleChapter("toggle", chapter.chapterId)}
                    src={assets.dropdown_icon}
                    width={14}
                    alt=""
                    className={`mr-2 cursor-pointer transition-all ${
                      chapter.collapsed && "-rotate-90"
                    }`}
                  />
                  <span className="font-semibold">
                    {index + 1} {chapter.chapterTitle}
                  </span>
                </div>
                <span className="text-gray-500">
                  {chapter.chapterContent.length} Lectures
                </span>
                <img
                  onClick={() => handleChapter("remove", chapter.chapterId)}
                  src={assets.cross_icon}
                  alt=""
                  className="cursor-pointer"
                />
              </div>
              {!chapter.collapsed && (
                <div className="p-4">
                  {chapter.chapterContent.map((lecture, lecIndex) => (
                    <div
                      key={lecIndex}
                      className="flex justify-between items-center mb-2"
                    >
                      <span>
                        {lecIndex + 1} {lecture.lectureTitle} -{" "}
                        {lecture.lectureDuration} mins |{" "}
                        <a href={lecture.lectureUrl} className="text-blue-500">
                          Link
                        </a>{" "}
                        - {lecture.isPreviewFree ? "Free Preview" : "Paid"}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt=""
                        className="cursor-pointer"
                        onClick={() =>
                          handleLecture("remove", chapter.chapterId, lecIndex)
                        }
                      />
                    </div>
                  ))}
                  <div
                    className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                    onClick={() => handleLecture("add", chapter.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
          <div
            className="flex justify-center items-center bg-purple-100 p-2 rounded-lg cursor-pointer"
            onClick={() => handleChapter("add")}
          >
            + Add Chapter
          </div>
          {/* Chapter_Title Functionality */}
          {eduPopupOpen && (
            <EduPopup
              message="Enter Chapter title"
              onSubmit={handleTitleSubmit}
              onClose={() => setEduPopupOpen(false)}
            />
          )}
          {/* Lecture_Details */}
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
              <div className="bg-white text-gray-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add Lecture
                  </h2>
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      setVideoFile(null);
                      setUploadProgress(0);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <img
                      src={assets.cross_icon}
                      alt="close"
                      className="w-5 h-5"
                    />
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
                      required
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
                      required
                    />
                  </div>

                  {/* Video Source Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video Source *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* YouTube Option */}
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
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">📺</span>
                          <span className="font-medium text-sm">YouTube</span>
                          <span className="text-xs text-gray-500">
                            Paste URL
                          </span>
                        </div>
                      </button>

                      {/* Cloudinary Upload Option */}
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
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">☁️</span>
                          <span className="font-medium text-sm">
                            Upload Video
                          </span>
                          <span className="text-xs text-gray-500">
                            MP4, WebM
                          </span>
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
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>💡</span>
                        Paste the full YouTube video URL
                      </p>
                    </div>
                  )}

                  {/* Cloudinary Video Upload */}
                  {lectureDetails.videoSource === "cloudinary" && (
                    <div className="space-y-3">
                      {/* Upload Area */}
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
                                // Check file size (max 500MB)
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
                            <div>
                              <span className="font-medium text-gray-700 block">
                                Click to upload video
                              </span>
                              <span className="text-xs text-gray-500 block mt-1">
                                MP4, WebM, or OGG (max 500MB)
                              </span>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Video Selected - Preview */}
                      {videoFile && !uploadingVideo && (
                        <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-lg">🎥</span>
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
                              className="text-gray-400 hover:text-red-600 transition-colors"
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

                      {/* Upload Progress */}
                      {uploadingVideo && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium">
                              Uploading video...
                            </span>
                            <span className="text-purple-600 font-semibold">
                              {uploadProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            Please don't close this window...
                          </p>
                        </div>
                      )}

                      {/* Instructions */}
                      <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <summary className="cursor-pointer font-medium text-blue-900 text-sm flex items-center gap-2">
                          <span>📘</span>
                          <span>Video upload tips</span>
                        </summary>
                        <ul className="mt-3 space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>Use MP4 format for best compatibility</li>
                          <li>Keep videos under 500MB for faster uploads</li>
                          <li>Recommended resolution: 1080p or 720p</li>
                          <li>
                            Video will be automatically optimized for streaming
                          </li>
                          <li>Upload time depends on your internet speed</li>
                        </ul>
                      </details>
                    </div>
                  )}

                  {/* Free Preview Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t rounded-b-xl">
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      setVideoFile(null);
                      setUploadProgress(0);
                    }}
                    type="button"
                    disabled={uploadingVideo}
                    className="flex-1 border-2 border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addLecture}
                    type="button"
                    disabled={
                      uploadingVideo ||
                      !lectureDetails.lectureTitle ||
                      !lectureDetails.lectureDuration ||
                      (lectureDetails.videoSource === "youtube" &&
                        !lectureDetails.lectureUrl) ||
                      (lectureDetails.videoSource === "cloudinary" &&
                        !videoFile)
                    }
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                  >
                    {uploadingVideo ? "Uploading..." : "Add Lecture"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-white w-max py-2.5 px-8 rounded my-4"
        >
          ADD
        </button>
      </form>
    </div>
  );
}

export default AddCourse;
