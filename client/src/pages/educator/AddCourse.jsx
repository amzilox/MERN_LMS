import { useReducer, useRef, useEffect, useState } from "react";
import uniqid from "uniqid";
import Quill from "quill";
import { toast } from "react-toastify";
import axios from "axios";

import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { useAppConfig } from "../../context/AppContext";
import EduPopup from "../../components/educator/EduPopup";
import AddLectureModal from "../../components/educator/AddLectureModal";
import {
  courseFormReducer,
  initialCourseFormState,
  COURSE_ACTIONS,
} from "../../reducers/courseFormReducer";

function AddCourse() {
  // Refs
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Context
  const { getToken } = useAuth();
  const { backendUrl } = useAppConfig();

  // Reducer for course form state
  const [formState, dispatch] = useReducer(
    courseFormReducer,
    initialCourseFormState
  );

  // Local UI state
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chapter handlers
  const handleAddChapter = (title) => {
    if (title) {
      const newChapter = {
        chapterId: uniqid(),
        chapterTitle: title,
        chapterContent: [],
        collapsed: false,
        chapterOrder:
          formState.chapters.length > 0
            ? formState.chapters[formState.chapters.length - 1].chapterOrder + 1
            : 1,
      };
      dispatch({ type: COURSE_ACTIONS.ADD_CHAPTER, payload: newChapter });
    }
    setShowChapterModal(false);
  };

  const handleRemoveChapter = (chapterId) => {
    dispatch({ type: COURSE_ACTIONS.REMOVE_CHAPTER, payload: chapterId });
  };

  const handleToggleChapter = (chapterId) => {
    dispatch({ type: COURSE_ACTIONS.TOGGLE_CHAPTER, payload: chapterId });
  };

  // Lecture handlers
  const handleOpenLectureModal = (chapterId) => {
    setCurrentChapterId(chapterId);
    setShowLectureModal(true);
  };

  const handleAddLecture = (lectureData) => {
    const newLecture = {
      ...lectureData,
      lectureOrder: getCurrentChapter()?.chapterContent.length + 1 || 1,
      lectureId: uniqid(),
    };

    dispatch({
      type: COURSE_ACTIONS.ADD_LECTURE,
      payload: {
        chapterId: currentChapterId,
        lecture: newLecture,
      },
    });
    toast.success("Lecture added successfully!");

    setShowLectureModal(false);
    setCurrentChapterId(null);
  };

  const handleRemoveLecture = (chapterId, lectureIndex) => {
    dispatch({
      type: COURSE_ACTIONS.REMOVE_LECTURE,
      payload: { chapterId, lectureIndex },
    });
  };

  // Helper
  const getCurrentChapter = () => {
    return formState.chapters.find((ch) => ch.chapterId === currentChapterId);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.image) {
      toast.error("Please select a course thumbnail");
      return;
    }

    if (formState.chapters.length === 0) {
      toast.error("Please add at least one chapter");
      return;
    }

    setIsSubmitting(true);

    try {
      const courseData = {
        courseTitle: formState.courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(formState.coursePrice),
        discount: Number(formState.discount),
        courseContent: formState.chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("image", formState.image);

      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);

        // Reset form
        dispatch({ type: COURSE_ACTIONS.RESET_FORM });
        if (quillRef.current) {
          quillRef.current.root.innerHTML = "";
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize Quill editor
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
        {/* Course Title */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Course Title *
          </label>
          <input
            type="text"
            onChange={(e) =>
              dispatch({
                type: COURSE_ACTIONS.SET_COURSE_TITLE,
                payload: e.target.value,
              })
            }
            value={formState.courseTitle}
            placeholder="Type here..."
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            required
          />
        </div>

        {/* Course Description */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Course Description *
          </label>
          <div ref={editorRef}></div>
        </div>

        {/* Price & Thumbnail */}
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Course Price *
            </label>
            <input
              type="number"
              placeholder="0"
              onChange={(e) =>
                dispatch({
                  type: COURSE_ACTIONS.SET_COURSE_PRICE,
                  payload: +e.target.value,
                })
              }
              value={formState.coursePrice}
              required
              className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Thumbnail *
            </label>
            <label htmlFor="thumbnailImage" className="cursor-pointer">
              <div className="flex items-center gap-3">
                <img
                  src={assets.file_upload_icon}
                  alt="upload_image"
                  className="p-3 bg-blue-500 rounded"
                />
                {formState.image && (
                  <img
                    src={URL.createObjectURL(formState.image)}
                    alt="thumbnail_image"
                    className="max-h-10"
                  />
                )}
              </div>
              <input
                onChange={(e) =>
                  dispatch({
                    type: COURSE_ACTIONS.SET_IMAGE,
                    payload: e.target.files[0],
                  })
                }
                type="file"
                id="thumbnailImage"
                accept="image/*"
                hidden
              />
            </label>
          </div>
        </div>

        {/* Discount  */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Discount % *
          </label>
          <input
            type="number"
            value={formState.discount}
            onChange={(e) =>
              dispatch({
                type: COURSE_ACTIONS.SET_DISCOUNT,
                payload: +e.target.value,
              })
            }
            placeholder="0"
            min={0}
            max={100}
            className="outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500"
            required
          />
        </div>

        {/* Chapters & Lectures */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Course Content
          </h3>
          {formState.chapters.map((chapter, index) => (
            <div
              key={chapter.chapterId}
              className="bg-white border rounded-lg mb-4"
            >
              {/* Chapter Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <img
                    onClick={() => handleToggleChapter(chapter.chapterId)}
                    src={assets.dropdown_icon}
                    width={14}
                    alt="toggle"
                    className={`cursor-pointer transition-transform ${
                      chapter.collapsed && "-rotate-90"
                    }`}
                  />
                  <span className="font-semibold text-fray-800">
                    {index + 1}. {chapter.chapterTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {chapter.chapterContent.length} Lectures
                  </span>
                  <img
                    onClick={() => handleRemoveChapter(chapter.chapterId)}
                    src={assets.cross_icon}
                    alt="remove"
                    className="cursor-pointer w-4 h-4 opacity-50 hover:opacity-100"
                  />
                </div>
              </div>

              {/* Chapter Content */}
              {!chapter.collapsed && (
                <div className="p-4 space-y-2">
                  {chapter.chapterContent.map((lecture, lecIndex) => (
                    <div
                      key={lecIndex}
                      className="flex justify-between items-center rounded hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {lecIndex + 1}. {lecture.lectureTitle} (
                        {lecture.lectureDuration} mins) -{" "}
                        {lecture.isPreviewFree ? "Free Preview" : "Paid"}
                      </span>
                      <img
                        src={assets.cross_icon}
                        alt="remove"
                        className="cursor-pointer w-4 h-4 opacity-50 hover:opacity-100"
                        onClick={() =>
                          handleRemoveLecture(chapter.chapterId, lecIndex)
                        }
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    className="inline-flex mt-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium  rounded"
                    onClick={() => handleOpenLectureModal(chapter.chapterId)}
                  >
                    + Add Lecture
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add Chapter Button */}
          <button
            type="button"
            onClick={() => setShowChapterModal(true)}
            className="w-full flex justify-center items-center bg-purple-100 text-purple-700 py-3 px-8 rounded-lg hover:bg-purple-200 transition-colors"
          >
            + Add Chapter
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white w-[3/4] py-3 px-8 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Course..." : "Create Course"}
        </button>
      </form>

      {/* Modals */}
      {showChapterModal && (
        <EduPopup
          message="Enter Chapter Title"
          onSubmit={handleAddChapter}
          onClose={() => setShowChapterModal(false)}
        />
      )}

      <AddLectureModal
        isOpen={showLectureModal}
        onClose={() => {
          setShowLectureModal(false);
          setCurrentChapterId(null);
        }}
        onAddLecture={handleAddLecture}
      />
    </div>
  );
}

export default AddCourse;
