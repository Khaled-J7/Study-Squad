// frontend/src/utils/helpers.js

// This file contains small, reusable functions for the application,
// configured to work with a local Django media server.

const API_BASE_URL = "http://127.0.0.1:8000";

// Define constants for local default images for consistency and easy updates.
const localDefaultAvatar = "/default.jpg"; // Located in /frontend/public/
const localDefaultCourseCover = "/course_card_default_cover_image.png"; // Located in /frontend/public/
const localDefaultStudioCover = "/default_cover.jpg"; // Located in /frontend/public/

/**
 * Safely gets the correct avatar URL for a user.
 * It handles the base URL, the default image, and missing profile data.
 * @param {object} user - The user object from our AuthContext.
 * @returns {string} The full URL for the avatar image.
 */
export const getAvatarUrl = (user) => {
  // Use optional chaining (?.) to prevent errors if user or profile is null.
  if (user?.profile?.profile_picture) {
    // If the backend provides a relative URL, we build the full path to it.
    return `${API_BASE_URL}${user.profile.profile_picture}`;
  }
  // If there's no picture, we fall back to our local default avatar.
  return localDefaultAvatar;
};

/**
 * Safely gets the full URL for a user's CV file.
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
 * Safely gets the list of degrees for a user.
 * @param {object} user - The user object.
 * @returns {Array} An array of degree strings, or an empty array.
 */
export const getDegrees = (user) => {
  return user?.profile?.degrees || [];
};

/**
 * Safely gets the contact email for a user.
 * @param {object} user - The user object.
 * @returns {string|null} The contact email or null if it doesn't exist.
 */
export const getContactEmail = (user) => {
  return user?.profile?.contact_email || null;
};

/**
 * Safely gets the full URL for a course's cover image.
 * @param {object} lesson - The lesson object.
 * @returns {string} The full URL for the course cover image.
 */
export const getCourseCoverUrl = (lesson) => {
  if (lesson?.cover_image) {
    // If the lesson has a cover image, build the full URL.
    return `${API_BASE_URL}${lesson.cover_image}`;
  }
  // Otherwise, fall back to our local default course cover.
  return localDefaultCourseCover;
};

/**
 * Safely gets the full URL for a studio's cover image.
 * @param {object} studio - The studio object.
 * @returns {string} The full URL for the studio cover image.
 */
export const getStudioCoverUrl = (studio) => {
  if (studio?.cover_image) {
    // If the studio has a cover image, build the full URL.
    return `${API_BASE_URL}${studio.cover_image}`;
  }
  // Otherwise, fall back to our local default studio cover.
  return localDefaultStudioCover;
};
