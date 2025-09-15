// frontend/src/api/profileService.js
import axiosInstance from "./axiosInstance";

/**
 * Updates the user's text and image profile data (excluding the CV).
 * This function uses FormData to correctly handle the profile picture file
 * alongside the other text-based data.
 * @param {object} detailsData - Contains username, about_me, degrees, and profile_picture file.
 */
const updateProfileDetails = async (detailsData) => {
  // THE FIX: We must use FormData because our view's parser expects it,
  // even if we are not sending a file in THIS specific request.
  const formData = new FormData();

  formData.append("username", detailsData.username);
  formData.append("about_me", detailsData.about_me);
  formData.append("contact_email", detailsData.contact_email);
  formData.append("degrees", JSON.stringify(detailsData.degrees));

  // We also still handle the profile picture here
  if (detailsData.profile_picture instanceof File) {
    formData.append("profile_picture", detailsData.profile_picture);
  }

  try {
    const response = await axiosInstance.put("/profile/update/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update profile details.",
      details: error.response?.data,
    };
  }
};

/**
 * A dedicated service object for handling all CV-related operations.
 * This architectural choice isolates complex file logic for better stability.
 */
const cvService = {
  /**
   * Uploads or replaces the user's CV file.
   * @param {File} cvFile - The file object selected by the user.
   */
  upload: async (cvFile) => {
    const formData = new FormData();
    formData.append("cv_file", cvFile);
    try {
      const response = await axiosInstance.post(
        "/profile/upload-cv/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to upload CV." };
    }
  },

  /**
   * Removes the user's current CV file.
   */
  remove: async () => {
    try {
      const response = await axiosInstance.delete("/profile/upload-cv/");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to remove CV." };
    }
  },
};

const profileService = {
  updateProfileDetails,
  cvService,
};

export default profileService;
