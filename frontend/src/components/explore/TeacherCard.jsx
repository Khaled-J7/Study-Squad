// frontend/src/components/explore/TeacherCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiBriefcase,
  HiAcademicCap,
  HiOutlineVideoCamera,
} from "react-icons/hi";
import { SiGmail } from "react-icons/si";
import "./TeacherCard.css";

/**
 * Renders a profile preview of a teacher.
 * @param {object} teacher - The teacher (user) data object from the API.
 */
const TeacherCard = ({ teacher }) => {
  const [isNameHovered, setIsNameHovered] = useState(false);

  const API_BASE_URL = "http://127.0.0.1:8000";
  const teacherAvatarUrl = `${API_BASE_URL}${teacher.profile.profile_picture}`;

  return (
    <div className="card-wrapper-teacher">
      <div className="teacher-card-avatar-container">
        <img
          src={teacherAvatarUrl}
          alt={teacher.username}
          className={`teacher-card-avatar ${isNameHovered ? "hovered" : ""}`}
        />
      </div>
      <div className="teacher-card-info">
        <h3
          className={`teacher-card-name ${isNameHovered ? "hovered" : ""}`}
          onMouseEnter={() => setIsNameHovered(true)}
          onMouseLeave={() => setIsNameHovered(false)}
        >
          {teacher.username}
        </h3>
        <p className="teacher-card-job-title">{teacher.job_title}</p>

        <div className="teacher-card-details">
          {teacher.experience?.length > 0 && (
            <div className="teacher-detail-group">
              <h4 className="teacher-detail-heading">Experience</h4>
              <div className="teacher-detail-item">
                <HiBriefcase className="teacher-detail-icon" />
                <span>{`${teacher.experience[0].title} at ${teacher.experience[0].company}`}</span>
              </div>
            </div>
          )}
          {teacher.degrees?.length > 0 && (
            <div className="teacher-detail-group">
              <h4 className="teacher-detail-heading">Degrees</h4>
              <div className="teacher-detail-item">
                <HiAcademicCap className="teacher-detail-icon" />
                <span>{teacher.degrees[0]}</span>
              </div>
            </div>
          )}
        </div>

        <div className="teacher-card-socials">
          <p className="teacher-socials-heading">Contact Instructor</p>
          <div className="teacher-social-icons">
            {teacher.social_links?.email && (
              <a href={teacher.social_links.email}>
                <SiGmail />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="card-footer teacher">
        <Link to="/meet" className="card-button-secondary">
          <HiOutlineVideoCamera /> Meet Now
        </Link>
        <Link
          to={`/studios/${teacher.studio_id}`}
          className="card-button-primary"
        >
          <span>View Studio</span>
          <HiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default TeacherCard;
