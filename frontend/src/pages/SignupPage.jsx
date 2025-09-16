// frontend/src/pages/SignupPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiEyeOff,
  HiEye,
} from "react-icons/hi";
import authService from "../api/authService";
// Reusable Error Component
import InlineError from "../components/common/InlineError/InlineError";
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

  // UPDATED: 'errors' state now handles both frontend and backend errors
  const [errors, setErrors] = useState({});

  // NEW: A dedicated validation function for the frontend
  const validate = () => {
    const newErrors = {};
    // Rule 1: Username length
    if (formData.username.length < 5) {
      newErrors.username = "Username must be at least 5 characters long.";
    }
    // Rule 2: Email format (simple regex check)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    // Rule 3: Password complexity
    if (!/(?=.*\d)(?=.*[a-zA-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one letter and one number.";
    }
    // Rule 4: Password length (mirrors our backend rule in settings.py)
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    // Rule 5: Passwords must match
    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match.";
    }
    setErrors(newErrors);
    // Return true if there are no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  // State to manage visibility for both password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

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

    // First, run frontend validation. If it fails, stop.
    if (!validate()) {
      return;
    }
    setLoading(true); // Indicate that the submission is in progress
    // setErrors({}); // Clear old errors before a new submission.

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

  // NEW: Toggle functions for each password field
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePassword2Visibility = () => setShowPassword2(!showPassword2);

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
                <InlineError message={errors.first_name} />
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
                <InlineError message={errors.last_name} />
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
              <InlineError message={errors.username} />
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
              <InlineError message={errors.email} />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              {/* UPDATED: The input is now wrapped for the icon */}
              <div className="input-wrapper password-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-btn"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
              <InlineError message={errors.password} />
            </div>

            <div className="input-group">
              <label htmlFor="password2">Confirm Password</label>
              {/* UPDATED: The input is now wrapped for the icon */}
              <div className="input-wrapper password-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type={showPassword2 ? "text" : "password"}
                  id="password2"
                  name="password2"
                  placeholder="••••••••"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword2Visibility}
                  className="password-toggle-btn"
                >
                  {showPassword2 ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
              <InlineError message={errors.password2} />
            </div>

            {/* General, non-field-specific errors */}
            <InlineError message={errors.detail} />

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
