// In frontend/src/api/studioService.js

import axiosInstance from "./axiosInstance";

/**
 * Creates a new studio by sending the form data to the backend.
 * @param {Object} studioData - The data collected from the creation form.
 * @returns {Object} An object with success status and data or error.
 */
const createStudio = async (studioData) => {
  // We must use FormData to handle the cover_image file upload correctly.
  const formData = new FormData();

  // We append each piece of data to the FormData object.
  formData.append("name", studioData.name);
  formData.append("description", studioData.description);

  // Only append the image if a new one was selected.
  if (studioData.cover_image) {
    formData.append("cover_image", studioData.cover_image);
  }

  // Append each tag individually.
  (studioData.tags || []).forEach((tag) => {
    formData.append("tags", tag);
  });

  try {
    const response = await axiosInstance.post("/studios/create/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Create studio API error:", error.response);
    return {
      success: false,
      error: "Failed to create studio. Please check the form.",
      details: error.response?.data,
    };
  }
};

const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get("/studio/dashboard/");
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch dashboard data.",
    };
  }
};

const updateCoverImage = async (coverImageFile) => {
  const formData = new FormData();
  formData.append("cover_image", coverImageFile);

  try {
    // We use PUT as defined in our backend view
    const response = await axiosInstance.put(
      "/studio/cover/update/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Update cover image API error:", error.response);
    return {
      success: false,
      error: "Failed to update cover image.",
      details: error.response?.data,
    };
  }
};

// Get studio details for the update form
const getStudioForUpdate = async () => {
  try {
    const response = await axiosInstance.get("/studio/update/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to fetch studio details." };
  }
};

// Send updated studio details to the backend
const updateStudio = async (studioData) => {
  try {
    const response = await axiosInstance.put("/studio/update/", studioData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update studio.",
      details: error.response?.data,
    };
  }
};

// Handles the request to permanently delete the user's studio.
const deleteStudio = async () => {
  try {
    // We send a DELETE request to the specific endpoint we created.
    // No data payload is needed for a delete operation.
    const response = await axiosInstance.delete("/studio/delete/");
    // On success, the backend returns a 204 No Content, so we return a simple success object.
    return { success: true };
  } catch (error) {
    // If anything goes wrong, we catch the error and return it for the component to handle.
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete studio.",
    };
  }
};

// Fetches all courses belonging to the authenticated teacher's studio.
const getMyCourses = async () => {
  try {
    // We send a GET request to the new endpoint.
    const response = await axiosInstance.get("/studio/my-courses/");
    return { success: true, data: response.data };
  } catch (error) {
    // Standard error handling for the frontend to display.
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch courses.",
    };
  }
};

/**
 * Fetches the list of subscribers for the teacher's studio.
 * Can include an optional search query to filter results.
 * @param {string} query - The search term.
 * @returns {Promise<Object>} The API response.
 */
const getSubscribers = async (query = "") => {
  try {
    // We pass the search query as a URL parameter.
    const response = await axiosInstance.get(`/studio/subscribers/?q=${query}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to fetch subscribers." };
  }
};

/**
 * Removes (blocks) a subscriber from the studio.
 * @param {number} userId - The ID of the user to block.
 * @returns {Promise<Object>} The API response.
 */
const blockSubscriber = async (userId) => {
  try {
    // We send a DELETE request to the specific endpoint for the user.
    await axiosInstance.delete(`/studio/subscribers/${userId}/block/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to block subscriber." };
  }
};

/**
 * Creates a new course of any type.
 * @param {FormData} courseFormData - The complete form data for the new course.
 * @returns {Promise<Object>} The API response.
 */
const createCourse = async (courseFormData) => {
  try {
    const response = await axiosInstance.post(
      "/studio/courses/create/",
      courseFormData,
      {
        // This header is essential for file uploads.
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    // We return detailed error information if available.
    return {
      success: false,
      error:
        error.response?.data?.detail ||
        "Failed to create course. Please check all fields.",
      details: error.response?.data,
    };
  }
};

/**
 * Permanently deletes a specific course.
 * @param {number} lessonId - The ID of the course to delete.
 * @returns {Promise<Object>} The API response.
 */
const deleteCourse = async (lessonId) => {
  try {
    // We send a DELETE request to the specific endpoint for this course.
    await axiosInstance.delete(`/studio/courses/${lessonId}/delete/`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete course.",
    };
  }
};

/**
 * Fetches the full, detailed data for a single course.
 * @param {number} lessonId - The ID of the course to fetch.
 * @returns {Promise<Object>} The API response.
 */
const getCourseDetail = async (lessonId) => {
  try {
    const response = await axiosInstance.get(`/studio/courses/${lessonId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to fetch course details." };
  }
};

/**
 * Updates an existing course with new data.
 * @param {number|string} lessonId - The ID of the course to update.
 * @param {FormData} courseData - The form data containing the updates.
 * @returns {Promise<Object>} The API response.
 */
const updateCourse = async (lessonId, courseData) => {
  try {
    // Let axios/browser set the multipart Content-Type (with boundary)
    const response = await axiosInstance.put(
      `/studio/courses/${lessonId}/update/`,
      courseData
      // no headers: { "Content-Type": "multipart/form-data" } here
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || "Failed to update course.",
      details: error.response?.data,
    };
  }
};

const studioService = {
  createCourse,
  createStudio,
  getDashboardData,
  updateCoverImage,
  getStudioForUpdate,
  updateStudio,
  deleteStudio,
  getMyCourses,
  getSubscribers,
  blockSubscriber,
  deleteCourse,
  getCourseDetail,
  updateCourse,
};

export default studioService;
