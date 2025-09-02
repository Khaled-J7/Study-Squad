// frontend/src/api/profileService.js
import axiosInstance from "./axiosInstance";

/**
 * Updates the user's profile data.
 * This function handles sending text data and an optional image file.
 * @param {Object} profileData - The data from the profile form.
 */
const updateProfile = async (profileData) => {
  // For file uploads, we must use the 'FormData' object.
  // This is how web browsers send files to a server.
  const formData = new FormData();

  // We'll go through the profileData object and add each item to our FormData.
  Object.keys(profileData).forEach((key) => {
    const value = profileData[key];
    // We only append the value if it's not null or undefined.
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });

  try {
    // We make a PUT request to our new endpoint.
    // We pass the formData and set the 'Content-Type' header, which is
    // crucial for file uploads.
    const response = await axiosInstance.put("/profile/update/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Profile update API error:", error.response);
    const fieldErrors = error.response?.data || {};
    return {
      success: false,
      error: "Failed to update profile. Please check the form.",
      fieldErrors,
    };
  }
};

const profileService = {
  updateProfile,
};

export default profileService;
