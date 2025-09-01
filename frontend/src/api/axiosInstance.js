// frontend/src/api/axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

// Our backend API's base URL.
const baseURL = "http://127.0.0.1:8000/api";

// This is our special, pre-configured axios instance for authenticated requests.
const axiosInstance = axios.create({
  baseURL,
});

// --- PRO-LEVEL TOKEN REFRESH LOGIC ---

// This flag prevents multiple token refresh requests from firing at the same time.
let isRefreshing = false;
// This is a queue to hold any requests that came in while we were refreshing the token.
let failedQueue = [];

// A helper function to process all the requests in the queue.
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      // If the refresh failed, we reject all queued promises.
      prom.reject(error);
    } else {
      // If the refresh succeeded, we resolve them with the new token.
      prom.resolve(token);
    }
  });
  failedQueue = []; // Clear the queue.
};

/**
 * Axios Request Interceptor
 * This is the gatekeeper for every single API call.
 */
axiosInstance.interceptors.request.use(
  async (req) => {
    const authTokens = localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null;

    // If there's no token, just let the request go through.
    if (!authTokens) {
      return req;
    }

    // Decode the token to check when it expires.
    const user = jwtDecode(authTokens.access);

    // Check if the token is expired. We'll use a 5-minute buffer, so we refresh it
    // before it actually expires, which is better for user experience.
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 300; // 300 seconds = 5 minutes

    if (!isExpired) {
      // If the token is still good, just add the Authorization header and send the request.
      req.headers.Authorization = `Bearer ${authTokens.access}`;
      return req;
    }

    // --- TOKEN REFRESH HANDLING ---

    // If a refresh is already in progress, we'll pause this request and add it to the queue.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // Once the refresh is done, the promise will resolve with the new token.
          req.headers.Authorization = `Bearer ${token}`;
          return req;
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // If we are the first request to find an expired token, we'll start the refresh.
    req._retry = true;
    isRefreshing = true;

    try {
      // Make the API call to get a new token.
      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: authTokens.refresh,
      });

      // Update the tokens in localStorage with the new access token.
      localStorage.setItem("authTokens", JSON.stringify(response.data));

      // Update the header of our current request.
      req.headers.Authorization = `Bearer ${response.data.access}`;

      // Process any requests that were queued while we were refreshing.
      processQueue(null, response.data.access);

      return req; // Finally, send the original request.
    } catch (err) {
      // If the refresh token is also bad, the refresh will fail.
      processQueue(err, null);

      // We'll fire off a custom event. Our AuthContext will be listening for this
      // and will know to log the user out completely.
      window.dispatchEvent(new Event("forceLogout"));

      return Promise.reject(err);
    } finally {
      // No matter what, we reset the refreshing flag.
      isRefreshing = false;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
