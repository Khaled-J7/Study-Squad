// frontend/src/pages/NotificationsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import meetingService from "../api/meetingService";
import { Video, X } from "lucide-react";
import "./NotificationsPage.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { invitations, updateInvitations } = useAuth();

  const handleUpdate = async (invitationId, status, roomName) => {
    await meetingService.updateInvitationStatus(invitationId, status);
    updateInvitations(invitations.filter((inv) => inv.id !== invitationId));
    if (status === "accepted") {
      navigate(`/meeting/${roomName}`);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <h1>My Invitations</h1>
        {invitations.length > 0 ? (
          <div className="invitations-list">
            {invitations.map((inv) => (
              <div key={inv.id} className="invitation-card">
                <div className="invitation-details">
                  <p>
                    <strong>{inv.meeting.host.first_name}</strong> invites you
                    to join <strong>"{inv.meeting.title}"</strong>.
                  </p>
                </div>
                <div className="invitation-actions">
                  <button
                    className="btn-decline"
                    onClick={() => handleUpdate(inv.id, "declined")}
                  >
                    Decline
                  </button>
                  <button
                    className="btn-accept"
                    onClick={() =>
                      handleUpdate(inv.id, "accepted", inv.meeting.room_name)
                    }
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have no new invitations.</p>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
