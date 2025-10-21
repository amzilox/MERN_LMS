import {
  BookOpen,
  Users,
  Package,
  Inbox,
  FileText,
  TrendingUp,
} from "lucide-react";
import { assets } from "../../assets/assets";

function EmptySection({
  title = "No Data Available",
  description = "There's nothing here yet. Check back later!",
  imageSrc = assets.cat,
  actionLabel,
  onAction,
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4`}>
      <img
        src={imageSrc}
        alt="Empty section illustration"
        className="w-48 md:w-64 mb-6 opacity-80 animate-bounce-slow"
      />
      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 text-center">
        {title}
      </h3>

      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptySection;
