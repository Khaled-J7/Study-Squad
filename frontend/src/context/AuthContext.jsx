// frontend/src/context/AuthContext.jsx
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import authService from "../api/authService";
import axiosInstance from "../api/axiosInstance";
import Spinner from "../components/common/Spinner"; 

// This is the "box" that will hold all our global auth data.
const AuthContext = createContext();

/**
 * This component is the "brain" of our app's authentication.
 * It provides the user's data and auth functions to any component that needs it.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // State to hold the tokens from localStorage.
  const [tokens, setTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  // State for the full user object.
  const [user, setUser] = useState(null);

  // 'loading' is for the initial check when the app first loads.
  const [loading, setLoading] = useState(true);

  // 'authLoading' is for when a user is actively logging in or out.
  const [authLoading, setAuthLoading] = useState(false);

  // This is a generic error state for auth-related issues.
  const [error, setError] = useState(null);

  /**
   * Handles the user login process.
   * NOTE: We've updated this to throw errors so the calling component can catch them.
   */
  const login = useCallback(
    async (username, password) => {
      setAuthLoading(true);
      setError(null);
      try {
        // First, get the tokens.
        const response = await authService.login(username, password);
        const newTokens = response.data;
        setTokens(newTokens);
        localStorage.setItem("authTokens", JSON.stringify(newTokens));

        // Then, use the new token to fetch the user's full profile.
        const userResponse = await axiosInstance.get("/auth/user/");
        setUser(userResponse.data);

        // Finally, send them to the homepage.
        navigate("/");
      } catch (err) {
        // This allows the LoginPage to catch it and handle its own UI.
        console.error("Login failed:", err);
        const errorMessage =
          err.response?.data?.detail ||
          "Invalid credentials. Please try again.";
        setError(errorMessage);
        throw err; // This is the key change to report the failure.
      } finally {
        setAuthLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Handles the user logout process.
   */
  const logout = useCallback(() => {
    // Clear our state and remove the tokens from storage.
    setTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    // Send the user back to the login page.
    navigate("/login");
  }, [navigate]);

  /**
   * A utility function to check if the current user is a teacher.
   * We know a user is a teacher if their user object has a 'studio' property.
   */
  const isTeacher = useCallback(() => {
    // The '!!' converts the result to a true boolean (true if studio exists, false otherwise).
    return !!user?.studio;
  }, [user]);

  /**
   * Refreshes the user data from the backend.
   * This is useful after a profile update to ensure the UI has the latest info.
   */
  const refreshUser = useCallback(async () => {
    // We only try to refresh if there's a token (meaning the user is logged in).
    if (tokens) {
      try {
        const userResponse = await axiosInstance.get("/auth/user/");
        // We update our global user state with the new data from the API.
        setUser(userResponse.data);
      } catch (error) {
        console.error("Failed to refresh user data:", error);
        // If the refresh fails (e.g., token expired), we log the user out.
        logout();
      }
    }
  }, [tokens, logout]); // We list dependencies here.

  // This effect runs only ONCE when the app starts.
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (tokens) {
        try {
          // If we have tokens, we'll verify them by fetching the user's data.
          const userResponse = await axiosInstance.get("/auth/user/");
          setUser(userResponse.data);
        } catch (error) {
          // If the tokens are invalid (e.g., expired refresh token), this will fail.
          // In this case, we just log them out.
          console.error(
            "Token is invalid on initial load, logging out.",
            error
          );
          logout();
        }
      }
      // This is crucial: we set loading to false only AFTER we've checked for a user.
      setLoading(false);
    };

    checkUserLoggedIn();
  }, [logout, tokens]);

  // This effect sets up our event listeners.
  useEffect(() => {
    // This is where we listen for the "flare signal" from our axiosInstance.
    // If the refresh token fails, axiosInstance will fire this event.
    const handleForceLogout = () => {
      console.log("forceLogout event received. Logging out.");
      logout();
    };

    // This listener helps us sync auth state across multiple browser tabs.
    // If the user logs out in one tab, this will log them out in all other tabs.
    const handleStorageChange = (e) => {
      if (e.key === "authTokens" && e.newValue === null) {
        console.log("authTokens removed from another tab. Logging out.");
        setUser(null);
        setTokens(null);
      }
    };

    window.addEventListener("forceLogout", handleForceLogout);
    window.addEventListener("storage", handleStorageChange);

    // We need to clean up the listeners when the component unmounts.
    return () => {
      window.removeEventListener("forceLogout", handleForceLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  // This is the data and functions that we provide to the whole app.
  const contextData = {
    user,
    tokens,
    loading,
    authLoading,
    error,
    login,
    logout,
    isTeacher,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {/* While the initial check is running, we show a loading Spinner. */}
      {loading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
};

/**
 * A custom hook that provides a clean shortcut for components to access the auth context.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
