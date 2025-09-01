// frontend/src/api/authService.js
import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Handles the user registration process.
 * Sends user data, now including first and last name, to the backend.
 */
const register = async (
  username,
  email,
  firstName,
  lastName,
  password,
  password2
) => {
  try {
    // NOTE: We've added firstName and lastName to the data we're sending.
    // The keys 'first_name' and 'last_name' must match what our Django serializer expects.
    const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
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
 * This function uses the standard axios for the public /token/ endpoint.
 */
const login = (username, password) => {
  // The actual logic of setting state is handled in AuthContext,
  // this service just makes the API call.
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
