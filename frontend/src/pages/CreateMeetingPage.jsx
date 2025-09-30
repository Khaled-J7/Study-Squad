// frontend/src/pages/CreateMeetingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import meetingService from "../api/meetingService";
import UserSearch from "../components/meetings/UserSearch";
import { getAvatarUrl } from "../utils/helpers";
import "./CreateMeetingPage.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [invitees, setInvitees] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect runs when the page loads to check for pre-filled data
  useEffect(() => {
    // Check if an initialInvitee was passed in the navigation state
    const initialInvitee = location.state?.initialInvitee;
    if (initialInvitee) {
      // If so, add them to our invitees list right away!
      setInvitees([initialInvitee]);
    }
  }, [location.state]); // This effect depends on the location state

  const addInvitee = (user) => {
    // Prevent adding the same user twice
    if (!invitees.some((invitee) => invitee.id === user.id)) {
      setInvitees([...invitees, user]);
    }
  };

  const removeInvitee = (userId) => {
    setInvitees(invitees.filter((invitee) => invitee.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const invitee_usernames = invitees.map((user) => user.username);
    if (invitee_usernames.length === 0) {
      setError("Please add at least one user to the invitation list.");
      setIsSubmitting(false);
      return;
    }

    const response = await meetingService.createMeeting({
      title,
      description,
      invitees: invitee_usernames,
    });

    if (response.success) {
      navigate(`/meeting/${response.data.room_name}`);
    } else {
      setError(response.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="create-meeting-page">
      <div className="create-meeting-card">
        <header className="create-meeting-header">
          <h1>Create a Meeting Room</h1>
          <p>
            Set up your private room and invite others to join the conversation.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Room Name</label>
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
            <label>Participants</label>
            <div className="participants-box">
              {invitees.length > 0 ? (
                <div className="invitee-pills">
                  {invitees.map((user) => (
                    <div key={user.id} className="invitee-pill">
                      <img src={getAvatarUrl(user)} alt={user.username} />
                      <span>{user.username}</span>
                      <button
                        type="button"
                        onClick={() => removeInvitee(user.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-participants-text">
                  Search for users below to add them to the meeting.
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Invite Members</label>
            <UserSearch onAddInvitee={addInvitee} />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="btn-create-room"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Room..." : "Create & Join Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
