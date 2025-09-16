// In frontend/src/components/explore/TeacherCard.jsx

import { useState } from "react";
import AuthLink from "../common/AuthLink";
import {
  HiArrowRight,
  HiBriefcase,
  HiAcademicCap,
  HiOutlineVideoCamera,
  HiDocumentText,
} from "react-icons/hi";
import { SiGmail } from "react-icons/si";
import {
  getAvatarUrl,
  getCvFileUrl,
  getDegrees,
  getContactEmail,
} from "../../utils/helpers";
import "./TeacherCard.css";

const TeacherCard = ({ teacher }) => {
  const [isNameHovered, setIsNameHovered] = useState(false);

  const teacherAvatarUrl = getAvatarUrl(teacher);
  const cvFileUrl = getCvFileUrl(teacher);
  const degrees = getDegrees(teacher);
  const contactEmail = getContactEmail(teacher);

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
          {`${teacher.first_name} ${teacher.last_name}`}
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

          {degrees.length > 0 && (
            <div className="teacher-detail-group">
              <h4 className="teacher-detail-heading">Degrees</h4>
              {degrees.map((degree, index) => (
                <div key={index} className="teacher-detail-item">
                  <HiAcademicCap className="teacher-detail-icon" />
                  <span className="teacher-degree-name">{degree}</span>
                </div>
              ))}
            </div>
          )}

          {cvFileUrl && (
            <div className="teacher-detail-group">
              <h4 className="teacher-detail-heading">CV / Resume</h4>
              <div className="teacher-detail-item">
                <HiDocumentText className="teacher-detail-icon" />
                <a
                  href={cvFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cv-link"
                >
                  View Credentials
                </a>
              </div>
            </div>
          )}
        </div>

        {contactEmail && (
          <div className="teacher-card-socials">
            <p className="teacher-socials-heading">Contact Instructor</p>
            <div className="teacher-social-icons">
              <a href={`mailto:${contactEmail}`}>
                <SiGmail />
              </a>
            </div>
          </div>
        )}
      </div>
      <div className="card-footer teacher">
        {/* ✅ Using AuthLink for protected actions */}
        <AuthLink to="/meet" className="card-button-secondary">
          <HiOutlineVideoCamera /> Meet Now
        </AuthLink>
        <AuthLink
          to={`/studios/${teacher.studio_id}`}
          className="card-button-primary"
        >
          <span>View Studio</span>
          <HiArrowRight />
        </AuthLink>
      </div>
    </div>
  );
};

export default TeacherCard;
