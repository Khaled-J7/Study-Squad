// frontend/src/api/axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

// The base URL for all our API requests
const baseURL = "http://127.0.0.1:8000/api";

// Check for existing tokens in browser's local storage
let authTokens = localStorage.getItem("authTokens")
  ? JSON.parse(localStorage.getItem("authTokens"))
  : null;

// Create a custom version of axios with pre-configured settings
const axiosInstance = axios.create({
  baseURL,
  // If we have an access token, set it as the default Authorization header
  headers: { Authorization: `Bearer ${authTokens?.access}` },
});

// This is the "interceptor" - a function that runs BEFORE every single request is sent
axiosInstance.interceptors.request.use(async (req) => {
  // Always get the latest tokens from storage before each request
  authTokens = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null;

  // If there are no tokens, the user is not logged in. Let the request proceed as is.
  if (!authTokens) {
    return req;
  }

  // Decode the access token to check its expiration date
  const user = jwtDecode(authTokens.access);
  const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1; // Check if expiration is in the past

  // If the token is not expired, let the request proceed
  if (!isExpired) {
    return req;
  }

  // If the token IS expired, we need to refresh it
  const response = await axios.post(`${baseURL}/token/refresh/`, {
    refresh: authTokens.refresh,
  });

  // Save the new tokens to local storage
  localStorage.setItem("authTokens", JSON.stringify(response.data));
  // Update the Authorization header of the original request with the new access token
  req.headers.Authorization = `Bearer ${response.data.access}`;

  return req;
});

export default axiosInstance;
