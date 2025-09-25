// frontend/src/components/dashboard/SubscriberCard.jsx
import React, { useState } from "react";
import { getAvatarUrl } from "../../utils/helpers";
import { MoreVertical, UserX, MessageSquare } from "lucide-react";
import "./SubscriberCard.css";

const SubscriberCard = ({ subscriber, onBlock }) => {
  // State to manage the visibility of the action menu (the three dots).
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const avatarUrl = getAvatarUrl(subscriber);

  return (
    <div className="subscriber-card">
      <img
        src={avatarUrl}
        alt={`${subscriber.first_name}'s avatar`}
        className="subscriber-avatar"
      />

      <div className="subscriber-info">
        <p className="subscriber-name">
          {subscriber.first_name} {subscriber.last_name}
        </p>
        <p className="subscriber-username">@{subscriber.username}</p>
      </div>

      <div className="subscriber-actions">
        {/* The "Meet Now" button is a placeholder for a future feature. */}
        <button className="meet-now-btn">
          <MessageSquare size={16} />
          <span>Meet Now</span>
        </button>

        {/* This is the three-dot menu for more actions. */}
        <div className="action-menu-container">
          <button
            className="more-actions-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreVertical size={20} />
          </button>

          {/* The dropdown menu appears when isMenuOpen is true. */}
          {isMenuOpen && (
            <div className="action-menu">
              <button
                onClick={() => {
                  onBlock(subscriber.id);
                  setIsMenuOpen(false);
                }}
              >
                <UserX size={16} />
                <span>Block User</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriberCard;
