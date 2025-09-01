// frontend/src/pages/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineIdentification,
} from "react-icons/hi";
import authService from "../api/authService";
import "./SignupPage.css";

const SignupPage = () => {
  // This helps us redirect the user after they sign up.
  const navigate = useNavigate();

  // State to hold the form data.
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    password2: "",
  });

  // State for loading and any errors from the backend.
  const [loading, setLoading] = useState(false);
  // NOTE: 'errors' is now an object to hold field-specific messages.
  const [errors, setErrors] = useState({});

  // Updates the state when a user types in a field.
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Also, clear the specific error for this field when the user starts typing again.
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // This function runs when the form is submitted.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading.
    setLoading(true); // Indicate that the submission is in progress
    setErrors({}); // Clear old errors before a new submission.

    // NOTE: We're now passing all the fields from our state to the register service.
    const response = await authService.register(
      formData.username,
      formData.email,
      formData.firstName,
      formData.lastName,
      formData.password,
      formData.password2
    );

    // Check the 'success' flag from our service's structured response.
    if (response.success) {
      // If successful, we can navigate the user to the login page.
      navigate("/login");
    } else {
      // If it fails, the service gives us a 'fieldErrors' object.
      // We'll set this object in our state to display the errors in the form.
      setErrors(response.fieldErrors);
    }

    setLoading(false); // Stop the loading indicator.
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
            {/* --- NEW: First Name and Last Name fields --- */}
            <div className="name-fields-group">
              <div className="input-group">
                <label htmlFor="firstName">First Name</label>
                <div className="input-wrapper">
                  <HiOutlineIdentification className="input-icon" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="e.g., Khaled"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.first_name && (
                  <p className="error-text">{errors.first_name}</p>
                )}
              </div>

              <div className="input-group">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-wrapper">
                  <HiOutlineIdentification className="input-icon" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="e.g., Jallouli"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.last_name && (
                  <p className="error-text">{errors.last_name}</p>
                )}
              </div>
            </div>
            {/* --- End of new fields --- */}

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <HiOutlineUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="khaledjallouli (no spaces)"
                  value={formData.username}
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
                  value={formData.email}
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
                  value={formData.password}
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
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.password2 && (
                <p className="error-text">{errors.password2}</p>
              )}
            </div>

            {errors.detail && (
              <p className="error-text general-error">{errors.detail}</p>
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
