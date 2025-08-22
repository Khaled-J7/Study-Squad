// frontend/src/components/explore/CourseCard.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  HiTag,
  HiArrowRight,
  HiCalendar,
  HiUserCircle,
  HiViewGrid,
} from "react-icons/hi";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const API_BASE_URL = "http://127.0.0.1:8000";
  const coverImageUrl = `${API_BASE_URL}${course.cover_image}`;
  // Access the nested teacher avatar URL
  const teacherAvatarUrl = `${API_BASE_URL}${course.studio.owner.profile.profile_picture}`;

  const creationDate = course.created_at
    ? new Date(course.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const shortDescription =
    course.description?.length > 100
      ? `${course.description.substring(0, 100)}...`
      : course.description;

  return (
    <div className="card-wrapper-course">
      <div className="course-card-image-container">
        <img
          src={coverImageUrl}
          alt={`${course.title} cover`}
          className="course-card-cover-image"
        />
      </div>
      <div className="course-card-info">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-description">
          {isDescExpanded ? course.description : shortDescription}
          {course.description?.length > 100 && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="course-card-read-more"
            >
              {isDescExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </p>

        {/* --- NEW TEACHER & STUDIO INFO SECTION --- */}
        <div className="course-card-meta">
          <div className="meta-item">
            <img
              src={teacherAvatarUrl}
              alt={course.studio.owner.username}
              className="meta-avatar"
            />
            <div className="meta-text">
              <span className="meta-label">Instructor</span>
              <span className="meta-value">{course.studio.owner.username}</span>
            </div>
          </div>
          <div className="meta-item">
            <HiViewGrid className="meta-icon" />
            <div className="meta-text">
              <span className="meta-label">Studio</span>
              <Link to={`/studios/${course.studio.id}`} className="meta-link">
                {course.studio.name}
              </Link>
            </div>
          </div>
        </div>

        <div className="card-tags">
          {course.tags?.map((tag) => (
            <Link
              to={`/explore?tags=${tag.name}`}
              key={tag.id}
              className="card-tag"
            >
              <HiTag /> {tag.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="card-footer course">
        <div className="card-stats">
          {creationDate && (
            <>
              <HiCalendar />
              <span>{creationDate}</span>
            </>
          )}
        </div>
        <Link to={`/courses/${course.id}`} className="card-button">
          <span>Explore Course</span>
          <HiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
