import { assets } from "../../assets/assets";
import SearchBar from "./SearchBar";

function Hero() {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-purple-100/70 via-pink-50/30 to-white">
      <h1 className="md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-4xl mx-auto">
        Master new skills with courses that{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-300">
          match your ambition
        </span>
        <img
          src={assets.sketch}
          alt="sketch"
          className="lg:block hidden absolute bottom-3 right-36  w-10 "
        />
        <img
          src={assets.sketch}
          alt="sketch"
          className="lg:block hidden absolute bottom-2 right-44 w-4 mr-1"
        />
      </h1>
      <p className="md:block hidden text-gray-600 max-w-2xl mx-auto pt-4 mt-1">
        Learn from{" "}
        <span className="text-gray-700 bg-yellow-200 rounded-md px-1.5 py-0.5 font-medium">
          industry experts
        </span>
        , engage with{" "}
        <span className="text-gray-700 bg-yellow-200 rounded-md px-1.5 py-0.5 font-medium">
          interactive content
        </span>
        , and join a thriving community dedicated to helping you reach your
        career goals <br />
        <span className="text-gray-700 bg-yellow-200 rounded-md px-1.5 py-0.5 font-medium">
          — at your own pace.
        </span>
      </p>
      <p className="md:hidden text-gray-500 max-w-sm mx-auto">
        We bring together{" "}
        <span className="text-gray-700 bg-yellow-200 rounded-md p-1 font-medium">
          world-class
        </span>{" "}
        instructors to help you achieve your professional{" "}
        <span className="text-gray-700 bg-yellow-200 rounded-md p-1 font-medium">
          goals.
        </span>
      </p>
      <SearchBar />
    </div>
  );
}

export default Hero;
