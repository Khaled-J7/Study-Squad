// frontend/src/utils/helpers.js

// This file will be home to small, reusable functions that we can use across our app.

const API_BASE_URL = "http://127.0.0.1:8000";
const localDefaultAvatar = "/default.jpg"; // default.jpg in /frontend/public/
const localDefaultCourseCover = "/course_card_default_cover_image.png";

/**
 * A helper function to safely get the correct avatar URL for a user.
 * It handles the base URL, the default image, and missing profile data.
 * @param {object} user - The user object from our AuthContext.
 * @returns {string} The full URL for the avatar image.
 */
export const getAvatarUrl = (user) => {
  // We use optional chaining (?.) to prevent errors if user or profile is null.
  if (user?.profile?.profile_picture) {
    // If the backend provides a URL, we build the full path to it.
    return `${API_BASE_URL}${user.profile.profile_picture}`;
  }
  // If there's no user or no picture, we fall back to our local default avatar.
  return localDefaultAvatar;
};

/**
 * ✅ NEW: Safely gets the full URL for a user's CV file.
 * @param {object} user - The user object.
 * @returns {string|null} The full URL for the CV or null if it doesn't exist.
 */
export const getCvFileUrl = (user) => {
  if (user?.profile?.cv_file) {
    return `${API_BASE_URL}${user.profile.cv_file}`;
  }
  return null;
};

/**
 * ✅ NEW: Safely gets the list of degrees for a user.
 * @param {object} user - The user object.
 * @returns {Array} An array of degree strings, or an empty array.
 */
export const getDegrees = (user) => {
  return user?.profile?.degrees || [];
};

/**
 * ✅ NEW: Safely gets the contact email for a user.
 * @param {object} user - The user object.
 * @returns {string|null} The contact email or null if it doesn't exist.
 */
export const getContactEmail = (user) => {
  return user?.profile?.contact_email || null;
};


export const getCourseCoverUrl = (lesson) => {
    if (lesson && lesson.cover_image) {
        // If there's a real image, show it.
        return `${API_BASE_URL}${lesson.cover_image}`;
    }
    // If the image is NULL, show our local default.
    return "/course_card_default_cover_image.png"; 
};
