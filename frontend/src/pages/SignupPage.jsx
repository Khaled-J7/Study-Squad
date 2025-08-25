// frontend/src/pages/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import authService from "../api/authService";
import "./SignupPage.css";

const SignupPage = () => {
  // This helps us redirect the user after they sign up
  const navigate = useNavigate();

  // State to hold the form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  // State for loading and any errors from the backend
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Updates the state when a user types in a field
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This function runs when the form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setLoading(true);
    setErrors({}); // Clear old errors

    try {
      await authService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.password2
      );
      // If successful, navigate to login
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
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
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">
              Join the Squad and start your learning journey today!
            </p>
          </div>

          <hr className="auth-divider" />

          <div className="social-proof">
            <p>Join a global community of curious minds</p>
            <div className="avatar-stack">
              <img src="https://i.pravatar.cc/40?img=10" alt="User 1" />
              <img src="https://i.pravatar.cc/40?img=12" alt="User 2" />
              <img src="https://i.pravatar.cc/40?img=14" alt="User 3" />
              <img src="https://i.pravatar.cc/40?img=16" alt="User 4" />
              <img src="https://i.pravatar.cc/40?img=18" alt="User 5" />
            </div>
          </div>

          <p className="auth-redirect-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="auth-right">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Sign Up</h2>
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
                  placeholder="e.g., johnsmith"
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.username && (
                <p className="error-text">{errors.username}</p>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <HiOutlineMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password2">Confirm Password</label>
              <div className="input-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.password2 && (
                <p className="error-text">{errors.password2}</p>
              )}
            </div>

            {errors.general && (
              <p className="error-text general-error">{errors.general}</p>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
