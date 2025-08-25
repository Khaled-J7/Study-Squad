// frontend/src/api/authService.js
import axios from "axios"; // For public requests
import axiosInstance from "./axiosInstance"; // For authenticated requests

const API_BASE_URL = "http://127.0.0.1:8000/api";

/**
 * Sends a registration request to the backend.
 * This is a public endpoint, so we use the standard axios.
 */
const register = (username, email, password, password2) => {
  return axios.post(`${API_BASE_URL}/auth/register/`, {
    username,
    email,
    password,
    password2,
  });
};

/**
 * Sends a login request to get JWT tokens.
 * This uses our special axiosInstance to ensure tokens are handled.
 */
const login = (username, password) => {
  return axiosInstance.post(`/token/`, {
    // We only need the endpoint path
    username,
    password,
  });
};

const authService = {
  register,
  login,
};

export default authService;
