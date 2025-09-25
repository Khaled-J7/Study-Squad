// frontend/src/pages/dashboard/DeleteStudioPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import studioService from "../../api/studioService";
import InlineError from "../../components/common/InlineError/InlineError";
import { AlertTriangle, Trash2 } from "lucide-react";
import "./DeleteStudioPage.css";

const DeleteStudioPage = () => {
  // We need the navigate function to redirect the user after deletion, and the logout function from our AuthContext.
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // We get the user to access the studio name directly.

  // State to hold the value of the confirmation input field.
  const [confirmationInput, setConfirmationInput] = useState("");
  // State to manage the loading and submitting processes.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // The confirmation text is the user's studio name. This makes the action very intentional.
  const confirmationText = user?.studio?.name || "";

  // The delete button should be disabled until the user types the exact studio name.
  const isButtonDisabled = confirmationInput !== confirmationText;

  // This is the main function that runs when the user confirms the deletion.
  const handleDelete = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Call our new API service function.
    const response = await studioService.deleteStudio();

    if (response.success) {
      // If the backend confirms the deletion, we log the user out.
      // This is important because their "teacher" role is now revoked, so they shouldn't be in the dashboard.
      logout();
      navigate("/"); // Redirect to the homepage after logout.
    } else {
      // If there's an error, we display it to the user.
      setError(response.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="delete-studio-page">
      <div className="delete-warning-box">
        <div className="warning-header">
          <AlertTriangle size={48} className="warning-icon" />
          <h1 className="warning-title">Delete Your Studio</h1>
        </div>

        <div className="warning-content">
          <p>
            This is a critical and irreversible action. Deleting your studio
            will permanently erase all of your content, including:
          </p>
          <ul>
            <li>All courses you have created.</li>
            <li>All subscriber data and interactions.</li>
            <li>Your studio's unique identity on Study Squad.</li>
          </ul>
          <p>
            This action cannot be undone. Are you absolutely sure you want to
            proceed?
          </p>
        </div>

        <form onSubmit={handleDelete} className="delete-form">
          <label htmlFor="confirmation" className="form-label">
            To confirm, please type your studio name:{" "}
            <strong>{confirmationText}</strong>
          </label>
          <input
            type="text"
            id="confirmation"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="form-input"
            placeholder="Type studio name here..."
            autoComplete="off"
          />

          <div className="delete-error-container">
            <InlineError message={error} />
          </div>

          <button
            type="submit"
            className="delete-button"
            disabled={isButtonDisabled || isSubmitting}
          >
            <Trash2 size={20} />
            <span>
              {isSubmitting
                ? "Deleting..."
                : "I understand, delete my studio permanently"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeleteStudioPage;
