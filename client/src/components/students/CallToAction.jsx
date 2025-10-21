import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

function CallToAction() {
  return (
    <div className="flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0">
      <h1 className="text-xl md:text-4xl text-gray-800 font-semibold">
        Learn anything, anytime, anywhere
      </h1>
      <p className="text-gray-600 sm:text-base max-w-2xl text-center leading-relaxed tracking-wide">
        <span className="text-gray-700 font-medium">
          Ready to take your skills to the next level?
        </span>{" "}
        Join thousands of learners who are transforming their careers with our{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 font-semibold">
          expert-led courses
        </span>
        . Start your journey today and unlock your full potential!
      </p>

      <div className="flex items-center font-medium gap-6 mt-4">
        <Link
          to="/course-list"
          className="px-10 py-3 rounded-md text-white bg-pink-600/70 hover:bg-pink-800/70"
        >
          Get started
        </Link>
        <button className="flex items-center gap-2">
          Learn more <img src={assets.arrow_icon} alt="arrow_icon" />
        </button>
      </div>
    </div>
  );
}

export default CallToAction;
