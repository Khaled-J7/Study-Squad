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

const studioService = {
  createStudio,
};

export default studioService;
