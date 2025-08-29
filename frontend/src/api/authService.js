// frontend/src/api/authService.js
import axios from "axios";

// NOTE: We are using the standard axios here for public requests (like login/register)
// because our special 'axiosInstance' is for authenticated requests.
const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Handles the user registration process.
 * Sends user data to the backend and returns a structured response.
 */
const register = async (username, email, password, password2) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
      username,
      email,
      password,
      password2,
    });
    // On success, we return a clean object for the component to use.
    return { success: true, data: response.data };
  } catch (error) {
    // If the request fails, we'll analyze the error response.
    console.error("Registration API error:", error.response);

    // This is where we parse the detailed validation errors from Django.
    const fieldErrors = error.response?.data || {};

    // We return a structured error object so our form knows exactly what went wrong.
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors,
    };
  }
};

/**
 * Handles the user login process.
 * We'll keep using our axiosInstance for this one since it kicks off
 * our authentication flow.
 */
const login = (username, password) => {
  // This is a wrapper around the original call, which will be handled
  // by our AuthContext. We're keeping it here to centralize all auth functions.
  return axios.post(`${API_BASE_URL}/token/`, {
    username,
    password,
  });
};

const authService = {
  register,
  login,
};

export default authService;