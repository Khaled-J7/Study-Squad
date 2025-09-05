// frontend/src/utils/helpers.js

// This file will be home to small, reusable functions that we can use across our app.

const API_BASE_URL = "http://127.0.0.1:8000";
const localDefaultAvatar = "/default.jpg"; // default.jpg in /frontend/public/

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
