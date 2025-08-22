// frontend/src/components/explore/StudioCard.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { HiUsers, HiArrowRight, HiTag, HiCalendar } from "react-icons/hi";
import "./StudioCard.css";

/**
 * Renders a preview card for a teacher's studio.
 * @param {object} studio - The studio data object from the API.
 */
const StudioCard = ({ studio }) => {
  const [isTeacherHovered, setIsTeacherHovered] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const API_BASE_URL = "http://127.0.0.1:8000";
  const coverImageUrl = `${API_BASE_URL}${studio.cover_image}`;
  const teacherAvatarUrl = `${API_BASE_URL}${studio.owner.profile.profile_picture}`;

  // Formats the ISO date string from the backend into a readable format.
  const creationDate = studio.created_at
    ? new Date(studio.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Truncates the description if it's longer than 100 characters.
  const shortDescription =
    studio.description?.length > 100
      ? `${studio.description.substring(0, 100)}...`
      : studio.description;

  return (
    <div className="card-wrapper">
      <div className="card-image-container">
        <img
          src={coverImageUrl}
          alt={`${studio.name} cover`}
          className="card-cover-image"
        />
        <img
          src={teacherAvatarUrl}
          alt={studio.owner.username}
          className={`card-teacher-avatar ${isTeacherHovered ? "hovered" : ""}`}
        />
      </div>
      <div className="card-info">
        <h3 className="card-title">{studio.name}</h3>
        <p className="card-teacher-name">
          by{" "}
          <Link
            to={`/teachers/${studio.owner.id}`}
            onMouseEnter={() => setIsTeacherHovered(true)}
            onMouseLeave={() => setIsTeacherHovered(false)}
          >
            {studio.owner.username}
          </Link>
        </p>
        <p className="card-description">
          {isDescExpanded ? studio.description : shortDescription}
          {studio.description?.length > 100 && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="studio-card-read-more"
            >
              {isDescExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </p>
        <div className="card-tags">
          {studio.tags?.slice(0, 3).map((tag) => (
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
      <div className="card-footer studio">
        <div className="card-stats">
          {creationDate && (
            <>
              <HiCalendar />
              <span>{creationDate}</span>
            </>
          )}
        </div>
        <Link to={`/studios/${studio.id}`} className="card-button">
          <span>View Studio</span>
          <HiArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default StudioCard;
