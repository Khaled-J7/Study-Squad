// frontend/src/api/meetingService.js

import axiosInstance from "./axiosInstance";

/**
 * Creates a new meeting and sends invitations.
 * @param {object} meetingData - Contains title, description, and an array of invitee usernames.
 * @returns {Promise<object>} The API response.
 */
const createMeeting = async (meetingData) => {
  try {
    // We send the title, description, and the list of invitees to the backend.
    const response = await axiosInstance.post("/meetings/create/", meetingData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create meeting.",
    };
  }
};

/**
 * Fetches the current user's pending, unread invitations.
 * @returns {Promise<object>} The API response.
 */
const getMyInvitations = async () => {
  try {
    const response = await axiosInstance.get("/invitations/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to fetch invitations." };
  }
};

/**
 * Updates the status of an invitation (accepts or declines).
 * @param {number} invitationId - The ID of the invitation to update.
 * @param {string} status - The new status ('accepted' or 'declined').
 * @returns {Promise<object>} The API response.
 */
const updateInvitationStatus = async (invitationId, status) => {
  try {
    const response = await axiosInstance.post(
      `/invitations/${invitationId}/update/`,
      { status }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update invitation.",
    };
  }
};

/**
 * Searches for users by a query string.
 * @param {string} query - The search term.
 * @returns {Promise<object>} The API response.
 */
const searchUsers = async (query) => {
  try {
    const response = await axiosInstance.get(`/users/search/?q=${query}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to search for users." };
  }
};

const meetingService = {
  createMeeting,
  getMyInvitations,
  updateInvitationStatus,
  searchUsers,
};

export default meetingService;
