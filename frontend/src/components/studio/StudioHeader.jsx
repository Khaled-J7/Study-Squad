// frontend/src/components/studio/StudioHeader.jsx

import React from "react";
import { getStudioCoverUrl, getAvatarUrl } from "../../utils/helpers";
import { Calendar, Check } from "lucide-react";
import "./StudioHeader.css";

const StudioHeader = ({
  studioData,
  onSubscribeClick,
  isSubmitting,
  isOwner,
}) => {
  const coverUrl = getStudioCoverUrl(studioData);
  // FIX: The owner data is nested inside the 'owner' object.
  const avatarUrl = getAvatarUrl(studioData.owner);

  return (
    <header className="studio-header">
      <div className="studio-cover-image-container">
        <img
          src={coverUrl}
          alt={`${studioData.name} cover`}
          className="studio-cover-image"
        />
      </div>
      <div className="studio-header-content">
        <div className="studio-avatar-info-wrapper">
          <div className="studio-avatar-container">
            <img
              src={avatarUrl}
              alt={studioData.owner.username}
              className="studio-avatar-image"
            />
          </div>
          <div className="studio-info">
            <h1 className="studio-name">{studioData.name}</h1>
            {/* FIX: Access owner's name correctly */}
            <p className="studio-owner-name">
              by {studioData.owner.first_name} {studioData.owner.last_name}
            </p>
          </div>
        </div>
        <div className="studio-actions">
          
          {/* We only show these buttons if the viewer is NOT the owner */}
          {!isOwner && (
            <>
              {/*Schedule Meeting Button */}
              <button
                className="btn btn-secondary"
                onClick={() => alert("Scheduling feature coming soon!")}
              >
                <Calendar size={18} />
                <span>Schedule Meeting</span>
              </button>
              {/* Subscribe Button */}
              <button
                className={`btn ${
                  studioData.is_subscribed
                    ? "btn-primary-outline"
                    : "btn-primary"
                }`}
                onClick={onSubscribeClick}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "..."
                ) : studioData.is_subscribed ? (
                  <>
                    <Check size={18} />
                    <span>Subscribed</span>
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default StudioHeader;
