// frontend/src/api/squadHubService.js

import axiosInstance from "./axiosInstance";

/**
 * Fetches all posts from the backend.
 * @returns {Promise<object>} The API response.
 */
const getPosts = async () => {
  try {
    const response = await axiosInstance.get("/posts/");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to fetch posts:", error.response);
    return { success: false, error: "Could not load posts." };
  }
};

/**
 * Creates a new post with a title, content, tags, and an optional file.
 * @param {FormData} postFormData - The complete form data for the new post.
 * @returns {Promise<object>} The API response.
 */
const createPost = async (postFormData) => {
  try {
    // Use the 'multipart/form-data' header for file uploads.
    const response = await axiosInstance.post("/posts/", postFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to create post:", error.response);
    return {
      success: false,
      error: "Failed to create post. Please check all fields.",
      details: error.response?.data,
    };
  }
};

/**
 * Fetches the full details for a single post by its ID.
 * @param {string|number} postId - The ID of the post to fetch.
 * @returns {Promise<object>} The API response.
 */
const getPostDetail = async (postId) => {
  try {
    const response = await axiosInstance.get(`/posts/${postId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to fetch post detail:", error.response);
    return { success: false, error: "Could not load the post." };
  }
};

/**
 * Adds a new comment to a post.
 * @param {string|number} postId - The ID of the post to comment on.
 * @param {string} content - The text of the comment.
 * @returns {Promise<object>} The API response.
 */
const createComment = async (postId, content) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/comments/`, {
      content,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to create comment:", error.response);
    return { success: false, error: "Could not post comment." };
  }
};

/**
 * Toggles a like on a post.
 * @param {string|number} postId - The ID of the post to like/unlike.
 * @returns {Promise<object>} The API response with the new like status and count.
 */
const togglePostLike = async (postId) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/like/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to update like status." };
  }
};

/**
 * Toggles a like on a comment.
 * @param {string|number} commentId - The ID of the comment to like/unlike.
 * @returns {Promise<object>} The API response with the new like status and count.
 */
const toggleCommentLike = async (commentId) => {
  try {
    const response = await axiosInstance.post(`/comments/${commentId}/like/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Failed to update like status." };
  }
};

const getMyPosts = async () => {
  try {
    const response = await axiosInstance.get("/posts/mine/");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: "Could not load your posts." };
  }
};

const deletePost = async (postId) => {
  try {
    await axiosInstance.delete(`/posts/${postId}/delete/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete post." };
  }
};

const deleteComment = async (commentId) => {
  try {
    await axiosInstance.delete(`/comments/${commentId}/delete/`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete comment." };
  }
};

const squadHubService = {
  getPosts,
  createPost,
  getPostDetail,
  createComment,
  togglePostLike,
  toggleCommentLike,
  getMyPosts,
  deletePost,
  deleteComment,
};

export default squadHubService;
