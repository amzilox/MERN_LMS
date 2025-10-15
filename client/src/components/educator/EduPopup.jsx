import { useState } from "react";
import { toast } from "react-toastify";

const EduPopup = ({ message, onSubmit, onClose }) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value) toast.error("Title not added!");
    onSubmit(value);
    onClose();
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 flex flex-col gap-4 animate-scaleIn">
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          {message}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter title..."
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EduPopup;
