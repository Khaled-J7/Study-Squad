// frontend/src/utils/helpers.js

// This file contains small, reusable functions for the application,
// configured to work with a local Django media server.

const API_BASE_URL = "http://127.0.0.1:8000";

const localDefaultAvatar = "/default.jpg";
const localDefaultCourseCover = "/course_card_default_cover_image.png";
const localDefaultStudioCover = "/default_cover.jpg";

/**
 * Checks if a given URL is a full, absolute URL.
 * @param {string} url - The URL to check.
 * @returns {boolean}
 */
const isAbsoluteUrl = (url) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

/**
 * Safely gets the correct avatar URL for a user.
 * @param {object} user - The user object from our AuthContext.
 * @returns {string} The full URL for the avatar image.
 */
export const getAvatarUrl = (user) => {
  const pictureUrl = user?.profile?.profile_picture;
  if (pictureUrl) {
    // If the URL is already absolute, return it. Otherwise, build it.
    return isAbsoluteUrl(pictureUrl)
      ? pictureUrl
      : `${API_BASE_URL}${pictureUrl}`;
  }
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
  const coverUrl = lesson?.cover_image;
  if (coverUrl) {
    return isAbsoluteUrl(coverUrl) ? coverUrl : `${API_BASE_URL}${coverUrl}`;
  }
  return localDefaultCourseCover;
};

/**
 * Safely gets the full URL for a studio's cover image.
 * @param {object} studio - The studio object.
 * @returns {string} The full URL for the studio cover image.
 */
export const getStudioCoverUrl = (studio) => {
  const coverUrl = studio?.cover_image;
  if (coverUrl) {
    return isAbsoluteUrl(coverUrl) ? coverUrl : `${API_BASE_URL}${coverUrl}`;
  }
  return localDefaultStudioCover;
};
