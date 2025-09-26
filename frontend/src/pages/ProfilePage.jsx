// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import profileService from "../api/profileService";
import { getAvatarUrl } from "../utils/helpers";
import {
  HiPencil,
  HiSparkles,
  HiCamera,
  HiCheck,
  HiX,
  HiViewGrid,
  HiOutlinePencilAlt,
  HiOutlineMail,
  HiAtSymbol,
  HiInformationCircle,
  HiAcademicCap,
  HiDocumentText,
  HiUpload,
  HiTrash,
  HiPlus,
} from "react-icons/hi";
import Spinner from "../components/common/Spinner";
import dayjs from "dayjs";
import InlineError from "../components/common/InlineError/InlineError";
import "./ProfilePage.css";

// This component serves as the user's main profile management center.
// It handles two primary states: "View Mode" for displaying information,
// and "Edit Mode" for updating it
const ProfilePage = () => {
  // --- STATE MANAGEMENT ---
  // The component's state is divided into several parts:
  // - Global user data from AuthContext.
  // - Local form data (`formData`) for controlled inputs during editing.
  // - UI state (`isEditMode`, `isSubmitting`) to control the display.
  // - State for handling new file uploads (`newProfilePicture`, `newCvFile`).
  // - State for managing the list of degrees (`degrees`).
  // - State for displaying validation errors (`errors`).
  const { user, isTeacher, refreshUser } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [newCvFile, setNewCvFile] = useState(null);
  const [degrees, setDegrees] = useState([]);
  const [newDegreeText, setNewDegreeText] = useState("");
  const [isUsernameOnCooldown, setIsUsernameOnCooldown] = useState(false);
  const [cooldownDaysLeft, setCooldownDaysLeft] = useState(0);

  // NEW: State to hold all validation errors
  const [errors, setErrors] = useState({});

  // Refs are used to programmatically trigger hidden file input clicks.
  const fileInputRef = useRef(null);
  const cvFileInputRef = useRef(null);

  // This effect synchronizes the component's local state with the global user object.
  // It runs whenever the `user` object from AuthContext changes.
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        headline: user.profile.headline || "",
        contact_email: user.profile.contact_email || "",
      });
      setDegrees(user.profile.degrees || []);
      if (user.profile.username_last_changed) {
        const lastChangedDate = dayjs(user.profile.username_last_changed);
        const cooldownEndDate = lastChangedDate.add(30, "day");
        const daysRemaining = cooldownEndDate.diff(dayjs(), "day");
        if (daysRemaining > 0) {
          setIsUsernameOnCooldown(true);
          setCooldownDaysLeft(daysRemaining + 1);
        } else {
          setIsUsernameOnCooldown(false);
        }
      } else {
        setIsUsernameOnCooldown(false);
      }
      // Reset all temporary states to ensure a clean form on each load.
      setNewCvFile(null);
      setNewProfilePicture(null);
      setPicturePreview("");
      setNewDegreeText("");
      setErrors({}); // Clear errors on user change
    }
  }, [user]);

  // --- HANDLER FUNCTIONS ---
  // These functions manage user interactions and state updates within the component.

  // Updates the formData state for standard text inputs.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // Clear the error for the specific field being edited
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  // Handles profile picture selection, including frontend validation for file size.
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 5MB limit (5 * 1024 * 1024 bytes)
      if (file.size > 5242880) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          profile_picture: "Image must be smaller than 5MB.",
        }));
        return;
      }
      // Clear any previous error if the file is valid
      setErrors((prevErrors) => ({ ...prevErrors, profile_picture: null }));
      setNewProfilePicture(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  // Manages state for the CV file input.
  const handleCvFileChange = (e) => {
    setNewCvFile(e.target.files[0] || null);
  };

  const handleRemoveCv = () => {
    setNewCvFile(false);
  };

  const handleAddDegree = () => {
    if (newDegreeText.trim() !== "") {
      setDegrees([...degrees, newDegreeText.trim()]);
      setNewDegreeText("");
    }
  };

  const handleRemoveDegree = (indexToRemove) => {
    setDegrees(degrees.filter((_, index) => index !== indexToRemove));
  };

  // Resets the form to its original state when editing is cancelled.
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // We re-initialize the local state from the global user object.
    if (user) {
      setFormData({
        username: user.username || "",
        about_me: user.profile.about_me || "",
        contact_email: user.profile.contact_email || "",
      });
      setDegrees(user.profile.degrees || []);
      setNewCvFile(null);
      setNewProfilePicture(null);
      setPicturePreview("");
    }
  };

  // Orchestrates the API calls to save all user changes.
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear old errors on a new submission
    let allSucceeded = true;

    // First, STEP 1: save the text and profile picture data via one service.
    const detailsData = {
      ...formData,
      degrees: degrees,
      profile_picture: newProfilePicture,
    };
    const detailsResponse = await profileService.updateProfileDetails(
      detailsData
    );
    if (!detailsResponse.success) {
      // Set field-specific errors from the backend response
      setErrors(detailsResponse.details || { general: detailsResponse.error });
      allSucceeded = false;
    }

    // Step 2: Handle the CV file operation only if the first step was successful.
    if (allSucceeded) {
      if (newCvFile instanceof File) {
        // This is an UPLOAD or REPLACE operation.
        const cvResponse = await profileService.cvService.upload(newCvFile);
        if (!cvResponse.success) {
          setErrors({ general: cvResponse.error });
          allSucceeded = false;
        }
      } else if (newCvFile === false) {
        // This is a REMOVE operation.
        const cvResponse = await profileService.cvService.remove();
        if (!cvResponse.success) {
          setErrors({ general: cvResponse.error });
          allSucceeded = false;
        }
      }
    }

    // Step 3: If all API calls were successful, refresh the global user state.
    if (allSucceeded) {
      await refreshUser();
      setIsEditMode(false);
    }

    setIsSubmitting(false);
  };

  if (!user || !formData) {
    return <Spinner />;
  }
  const avatarUrl = picturePreview || getAvatarUrl(user);

  return (
    <div className="profile-page-container">
      <div className="profile-card-header">
        {/* === LEFT COLUMN: Identity and Actions === */}
        <div className="profile-left-column">
          <div
            className="profile-avatar-wrapper"
            onClick={() => isEditMode && fileInputRef.current.click()}
          >
            <img src={avatarUrl} alt="User Avatar" className="profile-avatar" />
            {isEditMode && (
              <div className="avatar-overlay">
                <HiCamera className="avatar-overlay-icon" />
                <span>Change Photo</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePictureChange}
              style={{ display: "none" }}
              accept="image/png, image/jpeg"
            />
          </div>
          {/* NEW: Error message for profile picture */}
          {isEditMode && <InlineError message={errors.profile_picture} />}
          <div className="profile-user-info">
            <h1 className="profile-full-name">
              {`${user.first_name} ${user.last_name}`}
            </h1>
            <p className="profile-username">
              {isEditMode ? `@${formData.username}` : `@${user.username}`}
            </p>
          </div>

          <div className="profile-actions">
            {isEditMode ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="btn-profile btn-profile-save"
                  disabled={isSubmitting}
                >
                  <HiCheck /> {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn-profile btn-profile-cancel"
                >
                  <HiX /> Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="btn-profile btn-profile-primary"
                >
                  <HiPencil /> Edit Profile
                </button>
                {isTeacher() ? (
                  <Link
                    to="/my-studio"
                    className="btn-profile btn-profile-secondary"
                  >
                    <HiViewGrid /> Studio Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/studio/onboarding"
                    className="btn-profile btn-profile-secondary"
                  >
                    <HiSparkles /> Become a Teacher
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: Details Form === */}
        <div className="profile-right-column">
          <form className="profile-details-form" onSubmit={handleSaveChanges}>
            <div className="profile-details-grid">
              {/* --- USERNAME FIELD WITH COOLDOWN LOGIC --- */}
              <div className="detail-group">
                <label className="detail-label">
                  <HiAtSymbol className="detail-label-icon" /> Username
                </label>
                {isEditMode ? (
                  <>
                    <div className="detail-input-wrapper">
                      <HiAtSymbol className="detail-input-icon" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="detail-input"
                        disabled={isUsernameOnCooldown}
                      />
                    </div>
                    {/* RESTORED: Helper text for username */}
                    {isUsernameOnCooldown ? (
                      <div className="detail-helper-text">
                        <HiInformationCircle className="icon" />
                        You can change your username again in {
                          cooldownDaysLeft
                        }{" "}
                        {cooldownDaysLeft > 1 ? "days" : "day"}.
                      </div>
                    ) : (
                      <div className="detail-helper-text">
                        <HiInformationCircle className="icon" />
                        Username can be changed once every 30 days.
                      </div>
                    )}
                    <InlineError message={errors.username} />
                  </>
                ) : (
                  <div className="detail-value">
                    <HiAtSymbol className="detail-value-icon" />
                    {user.username}
                  </div>
                )}
              </div>

              {/* --- About Me --- */}
              <div className="detail-group">
                <label className="detail-label">
                  <HiOutlinePencilAlt className="detail-label-icon" />
                  Headline
                </label>
                {isEditMode ? (
                  <>
                    <div className="detail-input-wrapper">
                      <HiOutlinePencilAlt className="detail-input-icon" />
                      <textarea
                        name="headline"
                        value={formData.headline}
                        onChange={handleInputChange}
                        className="detail-textarea"
                        rows="2"
                        placeholder="Summarize your professional or academic role"
                      />
                    </div>
                    {/* RESTORED: Helper text for About Me */}
                    <div className="detail-helper-text">
                      <HiInformationCircle className="icon" />
                      This headline will be visible on your public profile.
                    </div>
                  </>
                ) : (
                  <div className="detail-value">
                    <HiOutlinePencilAlt className="detail-value-icon" />
                    {user.profile.headline || "No headline provided yet."}
                  </div>
                )}
              </div>

              {/* --- Contact Email --- */}
              <div className="detail-group">
                <label className="detail-label">
                  <HiOutlineMail className="detail-label-icon" />
                  Contact Email
                </label>
                {isEditMode ? (
                  <>
                    <div className="detail-input-wrapper">
                      <HiOutlineMail className="detail-input-icon" />
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        className="detail-input"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    {/* RESTORED: Helper text for Contact Email */}
                    <div className="detail-helper-text">
                      <HiInformationCircle className="icon" />
                      This email is essential for connecting with the community
                      and receiving alerts
                    </div>
                    <InlineError message={errors.contact_email} />
                  </>
                ) : (
                  <div className="detail-value">
                    <HiOutlineMail className="detail-value-icon" />
                    {user.profile.contact_email || "No contact email."}
                  </div>
                )}
              </div>
            </div>

            {/* === SIMPLIFIED CREDENTIALS SECTION === */}
            <div className="credentials-section">
              <h2 className="credentials-header">
                <HiAcademicCap className="detail-label-icon" /> Credentials
              </h2>

              {/* CV Management */}
              <div className="credential-item">
                <div className="credential-info">
                  <HiDocumentText />
                  <span className="credential-name">CV / Resume</span>
                </div>
                {isEditMode ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn-inline-action btn-attach"
                      onClick={() => cvFileInputRef.current.click()}
                    >
                      <HiUpload /> {newCvFile ? "Replace" : "Upload"}
                    </button>
                    {(user.profile.cv_file || newCvFile) &&
                      newCvFile !== false && (
                        <button
                          type="button"
                          onClick={handleRemoveCv}
                          className="credential-delete-btn"
                        >
                          <HiTrash />
                        </button>
                      )}
                    <input
                      type="file"
                      ref={cvFileInputRef}
                      onChange={handleCvFileChange}
                      style={{ display: "none" }}
                      accept=".pdf,.txt"
                    />
                    <span className="credential-file-link">
                      {newCvFile === false
                        ? "(To be removed)"
                        : newCvFile?.name || ""}
                    </span>
                  </div>
                ) : (
                  user.profile.cv_file && (
                    <a
                      href={`${"http://127.0.0.1:8000"}${user.profile.cv_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="credential-file-link"
                    >
                      View File
                    </a>
                  )
                )}
              </div>

              {/* Degrees Management */}
              <div className="detail-group">
                <label className="detail-label">Degrees & Certifications</label>
                {isEditMode ? (
                  <div>
                    <div className="dynamic-list-container">
                      {degrees.map((degree, index) => (
                        <div className="dynamic-list-item">
                          <div className="degree-item-content">
                            <HiAcademicCap className="degree-icon" />
                            <span>{degree}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDegree(index)}
                            className="list-remove-btn"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="add-degree-form">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add a new degree..."
                        value={newDegreeText}
                        onChange={(e) => setNewDegreeText(e.target.value)}
                        style={{ paddingLeft: "1rem" }}
                      />
                      <button
                        type="button"
                        onClick={handleAddDegree}
                        className="btn-inline-action btn-add"
                      >
                        <HiPlus /> Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="detail-value">
                    <ul className="degree-list-view">
                      {user.profile.degrees?.length > 0 ? (
                        user.profile.degrees.map((degree, index) => (
                          <li key={index}>
                            <HiAcademicCap className="degree-icon" />
                            <span>{degree}</span>
                          </li>
                        ))
                      ) : (
                        <li>No credentials listed.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* NEW: Display for general, non-field-specific errors */}
            {isEditMode && <InlineError message={errors.general} />}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
