// frontend/src/pages/LoginPage
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUser, HiOutlineLockClosed } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  // This helps us redirect the user after they log in
  const navigate = useNavigate();

  // Get the login function from our context
  const { login } = useAuth();

  // State to hold the form data
  const [formData, setFormData] = useState({ username: "", password: "" });

  const [loading, setLoading] = useState(false);

  // This will hold our error message from the backend
  const [error, setError] = useState("");

  // Updates the state when a user types in a field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the error message when the user starts typing again.
    if (error) {
      setError("");
    }
  };

  // This function runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setLoading(true);
    setError(""); // Clear old errors

    try {
      await login(formData.username, formData.password);
      // The navigate("/") call is now handled inside the login function itself(AuthContext)
    } catch (err) {
      // If login throws an error, we'll catch it here.
      const errorMessage =
        err.response?.data?.detail || "Invalid credentials. Please try again.";
      // We set the error message to be displayed on the login page.
      setError(errorMessage);
    } finally {
      // This will run whether the login succeeded or failed.
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        {/* LEFT COLUMN: Logo + Titles */}
        <div className="auth-left">
          <div className="auth-header">
            <img
              src="/StudySquadMainLogo.png"
              alt="Study Squad Logo"
              className="auth-logo-form"
            />
            <h1 className="auth-title">Welcome Back to the Squad</h1>
            <p className="auth-subtitle">
              Ready to continue your learning journey? Let's get you logged in!
            </p>
          </div>

          <hr className="auth-divider" />

          <div className="social-proof">
            <p>Your learning community awaits you</p>
            <div className="avatar-stack">
              <img src="https://i.pravatar.cc/40?img=10" alt="User 1" />
              <img src="https://i.pravatar.cc/40?img=12" alt="User 2" />
              <img src="https://i.pravatar.cc/40?img=14" alt="User 3" />
              <img src="https://i.pravatar.cc/40?img=16" alt="User 4" />
              <img src="https://i.pravatar.cc/40?img=18" alt="User 5" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="auth-right">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Log In</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <HiOutlineUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* We'll display our error message here, right above the button */}
            {error && <p className="error-text general-error">{error}</p>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="auth-redirect-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
