// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import authService from "../api/authService";
import axiosInstance from "../api/axiosInstance";

// This creates the "box" that will hold the global authentication data.
const AuthContext = createContext();

/**
 * This component is the provider. Its job is to manage all the authentication state
 * and provide it to any child component that needs it.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // State to hold the authentication tokens (access & refresh).
  // It initializes its state from localStorage to keep the user logged in on page refresh.
  const [tokens, setTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  // State to hold the FULL user object with profile details.
  const [user, setUser] = useState(null);

  // State to manage loading, prevents parts of the app from rendering before the initial auth check is complete.
  const [loading, setLoading] = useState(true);

  /**
   * Handles the user login process.
   */
  const login = async (username, password) => {
    // Call the API service to get tokens.
    const response = await authService.login(username, password);

    // Update the state with the new tokens.
    setTokens(response.data);

    // Store the new tokens in localStorage to persist the session.
    localStorage.setItem("authTokens", JSON.stringify(response.data));

    // After getting tokens, fetch the full user profile from our secure endpoint.
    const userResponse = await axiosInstance.get("/auth/user/");
    setUser(userResponse.data);

    // Redirect the user to the homepage after a successful login.
    navigate("/");
  };

  /**
   * Handles the user logout process.
   */
  const logout = () => {
    // Clear the state.
    setTokens(null);
    setUser(null);
    // Remove the tokens from localStorage.
    localStorage.removeItem("authTokens");
    // Redirect the user to the login page.
    navigate("/login");
  };

  // The data and functions that will be provided to the whole app.
  const contextData = {
    user,
    tokens,
    login,
    logout,
  };

  // This effect runs ONCE when the app starts up. It's the key to a stable login.
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (tokens) {
        try {
          // If we have tokens in localStorage, verify them by fetching the user's data.
          const userResponse = await axiosInstance.get("/auth/user/");
          setUser(userResponse.data);
        } catch (error) {
          // If the tokens are invalid (e.g., expired), log the user out.
          console.error(
            "Token is invalid on initial load, logging out.",
            error
          );
          logout();
        }
      }
      // This is crucial: we set loading to false only AFTER we have checked for a user.
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []); // The empty array [] ensures this runs only once.

  return (
    <AuthContext.Provider value={contextData}>
      {/* We don't render the rest of the app until the initial loading check is complete. This prevents the "flash" of a logged-out state. */}
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

/**
 * A custom hook that provides a clean shortcut for components to access the auth context.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
