// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import authService from "../api/authService";

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

  // State to hold the decoded user information from the access token.
  // Also initializes from localStorage.
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );

  // State to manage loading, prevents parts of the app from rendering before auth state is checked.
  const [loading, setLoading] = useState(true);

  /**
   * Handles the user login process.
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   */
  const loginUser = async (username, password) => {
    // Call the API service to get tokens.
    const response = await authService.login(username, password);

    // Decode the new access token to get user data.
    const decodedUser = jwtDecode(response.data.access);

    // Update the state with the new tokens and user info.
    setTokens(response.data);
    setUser(decodedUser);

    // Store the new tokens in localStorage to persist the session.
    localStorage.setItem("authTokens", JSON.stringify(response.data));

    // Redirect the user to the homepage after a successful login.
    navigate("/");
  };

  /**
   * Handles the user logout process.
   */
  const logoutUser = () => {
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
    loginUser, // Renamed for clarity
    logoutUser, // Renamed for clarity
  };

  // This effect runs once on initial load to ensure we are not showing a logged-out state
  // while we check for tokens in localStorage.
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={contextData}>
      {/* Don't render the rest of the app until the initial auth check is done */}
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
