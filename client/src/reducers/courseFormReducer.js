// Action types
export const COURSE_ACTIONS = {
  SET_COURSE_TITLE: "SET_COURSE_TITLE",
  SET_COURSE_PRICE: "SET_COURSE_PRICE",
  SET_DISCOUNT: "SET_DISCOUNT",
  SET_IMAGE: "SET_IMAGE",

  // Chapter actions
  ADD_CHAPTER: "ADD_CHAPTER",
  REMOVE_CHAPTER: "REMOVE_CHAPTER",
  TOGGLE_CHAPTER: "TOGGLE_CHAPTER",

  // Lecture actions
  ADD_LECTURE: "ADD_LECTURE",
  REMOVE_LECTURE: "REMOVE_LECTURE",

  // Reset
  RESET_FORM: "RESET_FORM",
};

// Initial state
export const initialCourseFormState = {
  courseTitle: "",
  coursePrice: "",
  discount: 0,
  image: null,
  chapters: [],
};

// Reducer function
export const courseFormReducer = (state, action) => {
  switch (action.type) {
    case COURSE_ACTIONS.SET_COURSE_TITLE:
      return { ...state, courseTitle: action.payload };

    case COURSE_ACTIONS.SET_COURSE_PRICE:
      return { ...state, coursePrice: action.payload };

    case COURSE_ACTIONS.SET_DISCOUNT:
      return { ...state, discount: action.payload };

    case COURSE_ACTIONS.SET_IMAGE:
      return { ...state, image: action.payload };

    case COURSE_ACTIONS.ADD_CHAPTER:
      return {
        ...state,
        chapters: [...state.chapters, action.payload],
      };

    case COURSE_ACTIONS.REMOVE_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.filter(
          (chapter) => chapter.chapterId !== action.payload
        ),
      };

    case COURSE_ACTIONS.TOGGLE_CHAPTER:
      return {
        ...state,
        chapters: state.chapters.map((chapter) =>
          chapter.chapterId === action.payload
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        ),
      };

    case COURSE_ACTIONS.ADD_LECTURE:
      return {
        ...state,
        chapters: state.chapters.map((chapter) =>
          chapter.chapterId === action.payload.chapterId
            ? {
                ...chapter,
                chapterContent: [
                  ...chapter.chapterContent,
                  action.payload.lecture,
                ],
              }
            : chapter
        ),
      };

    case COURSE_ACTIONS.REMOVE_LECTURE:
      return {
        ...state,
        chapters: state.chapters.map((chapter) =>
          chapter.chapterId === action.payload.chapterId
            ? {
                ...chapter,
                chapterContent: chapter.chapterContent.filter(
                  (_, index) => index !== action.payload.lectureIndex
                ),
              }
            : chapter
        ),
      };

    case COURSE_ACTIONS.RESET_FORM:
      return initialCourseFormState;

    default:
      return state;
  }
};
