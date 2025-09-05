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
  HiOutlineUserCircle,
  HiAtSymbol,
  HiInformationCircle,
} from "react-icons/hi";
import Spinner from "../components/common/Spinner";
import "./ProfilePage.css";

const ProfilePage = () => {
  // --- STATE MANAGEMENT ---
  // Here, we get all the necessary user data and helper functions from our global AuthContext.
  const { user, isTeacher, refreshUser } = useAuth();

  // This state is a simple boolean that toggles our component between "View Mode" and "Edit Mode".
  const [isEditMode, setIsEditMode] = useState(false);

  // This state is an object that will hold the user's changes as they type into the form.
  // It's separate from the main 'user' object to allow for easy cancellation of edits.
  const [formData, setFormData] = useState(null);

  // This state is a boolean to show a loading indicator on the "Save" button during an API call.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This state will hold the actual image FILE the user selects from their computer.
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  // This state will hold a temporary URL for the user's selected image, allowing us to show a preview.
  const [picturePreview, setPicturePreview] = useState("");

  // A ref is like a direct "wire" to a DOM element. We use it to programmatically "click" the hidden file input.
  const fileInputRef = useRef(null);

  // This effect runs once when the component loads, and again if the global 'user' object ever changes.
  // Its main job is to initialize our local 'formData' state with the current user's details.
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        about_me: user.profile.about_me || "",
        contact_email: user.profile.contact_email || "",
      });
      // We also clear any old picture previews, ensuring a clean state.
      setPicturePreview("");
      setNewProfilePicture(null);
    }
  }, [user]);

  // --- HANDLER FUNCTIONS ---

  // This function is connected to all our input fields (text, textarea, email).
  // It dynamically updates the 'formData' state as the user types.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // This function is triggered only when the user selects a new image file.
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file); // We store the actual file object.
      // We create a temporary, local URL so the browser can display the image preview instantly.
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  // This is the main submission function, called when the user clicks "Save Changes".
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // We create a single data object that includes the text from our form
    // AND the new picture file (if one was selected).
    const submissionData = {
      ...formData,
      profile_picture: newProfilePicture,
    };

    // We send this data to our API service, which handles the file upload format.
    const response = await profileService.updateProfile(submissionData);

    if (response.success) {
      // This is the most important step after a successful save.
      // It tells our global AuthContext to re-fetch the user's data from the server.
      // This ensures that the name and avatar in the Navbar (and everywhere else) update instantly.
      await refreshUser();
      setIsEditMode(false); // We switch back to "View Mode".
    } else {
      // If the backend sends back an error (like a username being taken), we'll show it.
      if (response.fieldErrors && response.fieldErrors.username) {
        alert(`Username Error: ${response.fieldErrors.username}`);
      } else {
        alert(response.error);
      }
    }

    setIsSubmitting(false);
  };

  // This function is called when the user clicks "Cancel" in Edit Mode.
  const handleCancelEdit = () => {
    setIsEditMode(false);
    // We simply discard any changes by resetting the form data back to the original user data.
    setFormData({
      username: user.username || "",
      about_me: user.profile.about_me || "",
      contact_email: user.profile.contact_email || "",
    });
    // We also clear any image the user might have selected.
    setNewProfilePicture(null);
    setPicturePreview("");
  };

  // --- RENDER LOGIC ---

  // While the initial user data is being loaded by AuthContext, we show our reusable Spinner.
  if (!user || !formData) {
    return <Spinner />;
  }

  // The avatar URL is determined by checking for a local preview first.
  // If a preview exists, we show it. If not, we use our helper to get the current avatar.
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

          <div className="profile-user-info">
            <h1 className="profile-full-name">
              {`${user.first_name} ${user.last_name}`}
            </h1>
            <p className="profile-username">
              {/* The username also has a live preview in the header */}
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

        {/* === RIGHT COLUMN: Details Form === */}
        <div className="profile-right-column">
          <form className="profile-details-form" onSubmit={handleSaveChanges}>
            <div className="profile-details-grid">
              <div className="detail-group">
                <label className="detail-label">
                  <HiAtSymbol className="detail-label-icon" />
                  Username
                </label>
                {isEditMode ? (
                  <div className="detail-input-wrapper">
                    <HiAtSymbol className="detail-input-icon" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiAtSymbol className="detail-value-icon" />
                    {user.username}
                  </div>
                )}
                {isEditMode && (
                  <div className="detail-helper-text">
                    <HiInformationCircle className="icon" />
                    Can only be changed once every 30 days.
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiOutlinePencilAlt className="detail-label-icon" />
                  About Me
                </label>
                {/* --- NEW: Guidance Text --- */}
                {isEditMode && (
                  <p className="detail-guidance-text">
                    Share a few words about yourself, your interests, or your
                    learning goals.
                  </p>
                )}
                {isEditMode ? (
                  <div className="detail-input-wrapper">
                    <HiOutlinePencilAlt className="detail-input-icon" />
                    <textarea
                      name="about_me"
                      value={formData.about_me}
                      onChange={handleInputChange}
                      className="detail-textarea"
                      rows="4"
                      placeholder="e.g., Lifelong learner and aspiring web developer..."
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiOutlinePencilAlt className="detail-value-icon" />
                    {user.profile.about_me || "No description provided yet."}
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiOutlineMail className="detail-label-icon" />
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
                    />
                  </div>
                ) : (
                  <div className="detail-value">
                    <HiOutlineMail className="detail-value-icon" />
                    {user.profile.contact_email || "No contact email."}
                  </div>
                )}
                {!isEditMode && (
                  <div className="detail-helper-text">
                    <HiInformationCircle className="icon" />
                    This email is displayed on teacher profiles for easy
                    contact.
                  </div>
                )}
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <HiOutlineUserCircle className="detail-label-icon" />
                  First Name
                </label>
                <div className="detail-value disabled">
                  <HiOutlineUserCircle className="detail-value-icon" />
                  {user.first_name} (cannot be changed)
                </div>
              </div>
              <div className="detail-group">
                <label className="detail-label">
                  <HiOutlineUserCircle className="detail-label-icon" />
                  Last Name
                </label>
                <div className="detail-value disabled">
                  <HiOutlineUserCircle className="detail-value-icon" />
                  {user.last_name} (cannot be changed)
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
