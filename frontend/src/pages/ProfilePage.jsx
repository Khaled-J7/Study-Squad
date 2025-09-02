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
  HiMail,
  HiChatAlt2,
  HiLockClosed,
  HiOutlineMail,
  HiOutlinePencilAlt,
  HiOutlineIdentification,
  HiIdentification,
  HiUserCircle,
  HiOutlineUserCircle,
  HiUser,
} from "react-icons/hi";
import Spinner from "../components/common/Spinner";
import "./ProfilePage.css";

const ProfilePage = () => {
  // --- STATE MANAGEMENT ---
  // We get all the necessary user data and functions from our global AuthContext.
  const { user, isTeacher, refreshUser } = useAuth();

  // This state will toggle between "View Mode" and "Edit Mode".
  const [isEditMode, setIsEditMode] = useState(false);

  // This state will hold the data for our edit form.
  const [formData, setFormData] = useState(null);

  // This state handles the loading spinner for our save button.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This state will hold the new image file the user selects.
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  // This state will hold a temporary URL for showing a preview of the new image.
  const [picturePreview, setPicturePreview] = useState("");

  // We use a ref to programmatically "click" the hidden file input element.
  const fileInputRef = useRef(null);

  // This effect runs when the component loads or when the global 'user' object changes.
  // Its job is to initialize our form's state with the latest user data.
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        about_me: user.profile.about_me || "",
        contact_email: user.profile.contact_email || "",
      });
      // We also clear any old picture previews when the user data changes.
      setPicturePreview("");
      setNewProfilePicture(null);
    }
  }, [user]);

  // --- HANDLER FUNCTIONS ---

  // This function updates our formData state whenever the user types in an input field.
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This function is triggered when the user selects a new image file.
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file); // We store the actual file object in state.
      // We create a temporary, local URL for the browser to display the image preview.
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  // This function is called when the user clicks the "Save Changes" button.
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // We combine the text data from our form with the new picture file (if one was selected).
    const submissionData = {
      ...formData,
      profile_picture: newProfilePicture,
    };

    // We send this combined data to our API service.
    const response = await profileService.updateProfile(submissionData);

    if (response.success) {
      // If the update is successful, we MUST call refreshUser().
      // This tells our AuthContext to re-fetch the user's data, so that
      // the Navbar and other components update with the new name and avatar instantly.
      await refreshUser();
      setIsEditMode(false); // Switch back to View Mode.
    } else {
      // For now, we'll just show a simple alert. We can build a better notification system later.
      alert(response.error);
    }

    setIsSubmitting(false);
  };

  // This function is called when the user clicks "Cancel" in Edit Mode.
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // We reset the form data back to its original state from the global 'user' object.
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      about_me: user.profile.about_me || "",
      contact_email: user.profile.contact_email || "",
    });
    // We also clear any selected image preview.
    setNewProfilePicture(null);
    setPicturePreview("");
  };

  // --- RENDER LOGIC ---

  // While the initial user data is loading, we show our reusable Spinner component.
  if (!user || !formData) {
    return <Spinner />;
  }

  // The avatar URL is now determined by checking for a local preview first.
  // If a preview exists, we show it. If not, we use our helper to get the current avatar.
  const avatarUrl = picturePreview || getAvatarUrl(user);

  return (
    <div className="profile-page-container">
      {/* === The Two-Column Layout === */}
      <header className="profile-card-header">
        {/* LEFT COLUMN: Profile Image, Name, Username, Actions */}
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

          <div className="profile-user-info">
            <h1 className="profile-full-name">
              {isEditMode
                ? `${formData.first_name} ${formData.last_name}`
                : `${user.first_name} ${user.last_name}`}
            </h1>
            <p className="profile-username">@{user.username}</p>
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
                    to="/become-teacher"
                    className="btn-profile btn-profile-secondary"
                  >
                    <HiSparkles /> Become a Teacher
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Details Form */}
        <div className="profile-right-column">
          <form className="profile-details-form" onSubmit={handleSaveChanges}>
            <div className="profile-details-grid">
              <div className="detail-group">
                <label className="detail-label">
                  <HiUserCircle className="detail-label-icon" />
                  First Name
                </label>
                {isEditMode ? (
                  <div className="detail-input-wrapper">
                    <HiOutlineUserCircle className="detail-input-icon" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="detail-input"
                      placeholder="Enter your first name"
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiUserCircle className="detail-value-icon" />
                    {user.first_name || "Not provided"}
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiUserCircle className="detail-label-icon" />
                  Last Name
                </label>
                {isEditMode ? (
                  <div className="detail-input-wrapper">
                    <HiOutlineUserCircle className="detail-input-icon" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="detail-input"
                      placeholder="Enter your last name"
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiUserCircle className="detail-value-icon" />
                    {user.last_name || "Not provided"}
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiChatAlt2 className="detail-label-icon" />
                  About Me
                </label>
                {isEditMode ? (
                  <div className="detail-input-wrapper">
                    <HiOutlinePencilAlt className="detail-input-icon" />
                    <textarea
                      name="about_me"
                      value={formData.about_me}
                      onChange={handleInputChange}
                      className="detail-textarea"
                      rows="4"
                      placeholder="Tell others about yourself, your interests, and your learning journey..."
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiChatAlt2 className="detail-value-icon" />
                    {user.profile.about_me || "No description provided yet."}
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiMail className="detail-label-icon" />
                  Contact Email
                </label>
                {isEditMode ? (
                  <div className="detail-input-wrapper">
                    <HiOutlineMail className="detail-input-icon" />
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="detail-input"
                      placeholder="your.contact@example.com"
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiMail className="detail-value-icon" />
                    {user.profile.contact_email || "No contact email provided"}
                  </div>
                )}
                {!isEditMode && (
                  <div className="detail-helper-text">
                    This email is displayed on your teacher profile for students
                    and instructors to connect with you.
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiLockClosed className="detail-label-icon" />
                  Account Email
                </label>
                <div className="detail-value disabled">
                  <HiLockClosed className="detail-value-icon" />
                  {user.email} (cannot be changed)
                </div>
              </div>
            </div>
          </form>
        </div>
      </header>
    </div>
  );
};

export default ProfilePage;
