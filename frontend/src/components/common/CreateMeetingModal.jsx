// frontend/src/components/common/CreateMeetingModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import meetingService from "../../api/meetingService";
import InlineError from "./InlineError/InlineError";
import "./CreateMeetingModal.css";

const CreateMeetingModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [invitees, setInvitees] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Split the invitees string into an array of usernames
    const invitee_usernames = invitees
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    if (invitee_usernames.length === 0) {
      setError("Please invite at least one user.");
      setIsSubmitting(false);
      return;
    }

    const response = await meetingService.createMeeting({
      title,
      description,
      invitees: invitee_usernames,
    });

    if (response.success) {
      onClose(); // Close the modal
      // Navigate to the new meeting page
      navigate(`/meeting/${response.data.room_name}`);
    } else {
      setError(response.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Create a New Meeting</h2>
        <p>Invite users to a private video call.</p>
        <form onSubmit={handleSubmit} className="meeting-form">
          <div className="form-group">
            <label htmlFor="title">Meeting Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="invitees">Invite Users by Username</label>
            <input
              type="text"
              id="invitees"
              value={invitees}
              onChange={(e) => setInvitees(e.target.value)}
              placeholder="e.g., JaneSmith, JohnDoe"
              required
            />
            <small>Separate usernames with a comma.</small>
          </div>
          {error && <InlineError message={error} />}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create & Join Meeting"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
