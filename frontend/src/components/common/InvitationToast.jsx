// frontend/src/components/common/InvitationToast.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Video, X } from "lucide-react";
import "./InvitationToast.css";

const InvitationToast = ({ invitation, onAccept, onDecline }) => {
  const { meeting } = invitation;

  return (
    <div className="invitation-toast">
      <div className="toast-icon">
        <Video size={24} />
      </div>
      <div className="toast-content">
        <p className="toast-title">Meeting Invitation</p>
        <p className="toast-body">
          <strong>
            {meeting.host.first_name} {meeting.host.last_name}
          </strong>{" "}
          is inviting you to join "{meeting.title}".
        </p>
      </div>
      <div className="toast-actions">
        <button
          className="btn-decline"
          onClick={() => onDecline(invitation.id)}
        >
          Decline
        </button>
        <button
          className="btn-accept"
          onClick={() => onAccept(invitation.id, meeting.room_name)}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default InvitationToast;
