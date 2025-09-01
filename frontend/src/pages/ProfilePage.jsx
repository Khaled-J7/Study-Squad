// frontend/src/pages/ProfilePage.jsx
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { HiBriefcase, HiAcademicCap, HiPencil } from "react-icons/hi";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading profile...</div>;
  }

  const API_BASE_URL = "http://127.0.0.1:8000";
  const avatarUrl = `${API_BASE_URL}${user.profile.profile_picture}`;

  const isTeacher = !!user.studio; // Check if the user has a studio

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-wrapper">
            <img
              src={avatarUrl}
              alt={`${user.username}'s profile`}
              className="profile-avatar"
            />
            <button className="change-picture-btn">
              <HiPencil />
            </button>
          </div>
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <button className="btn-edit-profile">Edit Profile</button>
        </div>
        <div className="profile-body">
          <div className="profile-section">
            <h3>About Me</h3>
            <p>
              {user.profile.bio ||
                'You have not set a bio yet. Click "Edit Profile" to add one!'}
            </p>
          </div>

          {isTeacher ? (
            <div className="profile-section">
              <h3>Instructor Details</h3>
              <div className="detail-item">
                <HiBriefcase className="detail-icon" />
                <span>{user.studio.job_title}</span>
              </div>
              {/* We can map over experience and degrees here later */}
            </div>
          ) : (
            <div className="become-teacher-callout">
              <h3>Want to share your knowledge?</h3>
              <p>
                Create your own studio, design courses, and connect with
                learners.
              </p>
              <Link to="/create-studio" className="btn-cta-primary">
                Become a Teacher
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
