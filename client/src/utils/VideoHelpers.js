/**
 * Extract YouTube video ID from a URL
 * Works with these formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export const extractYouTubeId = (url) => {
  // If nothing provided, return null
  if (!url) return null;

  // Remove any spaces
  url = url.trim();
  // If it's already just an ID (11 characters), return it
  if (url.length === 11) return url;

  // Try to find the video ID in different URL formats
  let videoId;

  // Case 1: youtube.com/watch?v=VIDEO_ID
  if (url.includes("watch?v=")) {
    const parts = url.split("watch?v=");
    videoId = parts[1];
  }

  // Case 2: youtube/VIDEO_ID
  else if (url.includes("youtube.com/")) {
    const parts = url.split("youtube.com/");
    videoId = parts[1];
  }

  // Case 3: youtu.be/VIDEO_ID
  else if (url.includes("youtu.be/")) {
    const parts = url.split("youtu.be/");
    videoId = parts[1];
  }
  // Case 4: youtube.com/embed/VIDEO_ID
  else if (url.includes("embed/")) {
    const parts = url.split("embed/");
    videoId = parts[1];
  }

  // Clean up any extra stuff after the ID
  if (videoId) {
    // Remove anything after / (in case of extra path)
    videoId = videoId.split("/")[0];
  }

  // Only return if we got exactly 11 characters
  return videoId && videoId.length === 11 ? videoId : null;
};

/**
 * Check if a YouTube URL is valid
 */
export const isValidYouTubeUrl = (url) => {
  const videoId = extractYouTubeId(url);
  return videoId !== null;
};

/**
 * Get thumbnail URL for a YouTube video
 */
export const getYouTubeThumbnail = (url) => {
  const videoId = extractYouTubeId(url);

  if (!videoId) return null;

  // YouTube thumbnail URL format
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};
