// In frontend/src/components/explore/StudioCard.jsx

import { useState } from "react";
import AuthLink from "../common/AuthLink";
import {
  HiUsers,
  HiStar,
  HiTag,
  HiArrowRight,
  HiInformationCircle,
} from "react-icons/hi";
import { getAvatarUrl, getStudioCoverUrl } from "../../utils/helpers";
import "./StudioCard.css";

const StudioCard = ({ studio }) => {
  const [isTeacherHovered, setIsTeacherHovered] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const studioCoverImage = getStudioCoverUrl(studio);
  const teacherAvatarUrl = getAvatarUrl(studio.owner);

  const creationDate = studio.created_at
    ? new Date(studio.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const shortDescription =
    studio.description?.length > 100
      ? `${studio.description.substring(0, 100)}...`
      : studio.description;

  const formattedRating =
    studio.average_rating > 0 ? studio.average_rating.toFixed(1) : null;

  return (
    <div className="card-wrapper">
      <div className="card-image-container">
        <img
          src={studioCoverImage}
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
          <AuthLink
            to={`/teachers/${studio.owner.id}`}
            onMouseEnter={() => setIsTeacherHovered(true)}
            onMouseLeave={() => setIsTeacherHovered(false)}
          >
            {`${studio.owner.first_name} ${studio.owner.last_name}`}
          </AuthLink>
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
            <AuthLink
              to={`/explore?tags=${tag.name}`}
              key={tag.id}
              className="card-tag"
            >
              <HiTag /> {tag.name}
            </AuthLink>
          ))}
        </div>
      </div>
      <div className="card-footer studio">
        <div className="card-stats">
          <div className="stat-item">
            <HiUsers />
            <span>{studio.subscribers_count}</span>
          </div>
          {formattedRating && (
            <div className="stat-item">
              <HiStar />
              <span>{formattedRating}</span>
            </div>
          )}
          {/* ✅ UPDATED: The creation date is now a tooltip */}
          {creationDate && (
            <div className="stat-item tooltip-trigger">
              <HiInformationCircle />
              <span className="tooltip-text">Created: {creationDate}</span>
            </div>
          )}
        </div>
        <AuthLink to={`/studios/${studio.id}`} className="card-button">
          <span>View Studio</span>
          <HiArrowRight />
        </AuthLink>
      </div>
    </div>
  );
};

export default StudioCard;
