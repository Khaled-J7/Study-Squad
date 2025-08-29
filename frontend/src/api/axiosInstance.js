// frontend/src/api/axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

// Define the base URL for all API requests to the backend.
const baseURL = "http://127.0.0.1:8000/api";

// Create a custom instance of axios. This allows us to have a pre-configured
// version of axios that we can use throughout our application.
const axiosInstance = axios.create({
  baseURL,
});

/**
 * Axios Request Interceptor
 * This is a powerful feature that acts as a "gatekeeper" for every single API call
 * made with this axiosInstance. Before a request is sent, this function runs.
 */
axiosInstance.interceptors.request.use(async (req) => {
  // Always get the latest tokens from localStorage before each request.
  // This ensures we're not using stale data.
  const authTokens = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null;

  // If there are no tokens, the user is not logged in.
  // We let the request proceed without an Authorization header.
  if (!authTokens) {
    return req;
  }

  // If tokens exist, decode the access token to check its expiration date.
  const user = jwtDecode(authTokens.access);

  // Use dayjs to compare the token's expiration time (user.exp) with the current time.
  // We check if the token has less than a minute of validity left.
  const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 60; // Check if expired or close to expiring

  // If the token is not expired, add the Authorization header and let the request proceed.
  if (!isExpired) {
    req.headers.Authorization = `Bearer ${authTokens.access}`;
    return req;
  }

  // --- TOKEN REFRESH LOGIC ---
  // If the access token is expired, we need to get a new one using the refresh token.
  try {
    const response = await axios.post(`${baseURL}/token/refresh/`, {
      refresh: authTokens.refresh,
    });

    // If the refresh is successful, update localStorage with the new tokens.
    localStorage.setItem("authTokens", JSON.stringify(response.data));

    // Update the Authorization header of the original, paused request with the new access token.
    req.headers.Authorization = `Bearer ${response.data.access}`;

    return req; // Let the original request proceed with the new token.
  } catch (error) {
    console.error("Token refresh failed", error);
    // If the refresh token is also expired or invalid, this will fail.
    // The AuthContext will handle logging the user out in this case.
    return Promise.reject(error);
  }
});

export default axiosInstance;