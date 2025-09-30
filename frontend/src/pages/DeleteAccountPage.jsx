// frontend/src/pages/DeleteAccountPage.jsx

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import authService from "../api/authService";
import { AlertTriangle, Trash2 } from "lucide-react";
import "./DeleteAccountPage.css";

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const response = await authService.deleteAccount();
    if (response.success) {
      // If the account is deleted successfully, log the user out
      // which will clear all local data and redirect them.
      logout();
    } else {
      alert(response.error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="delete-account-page">
      <div className="delete-account-card">
        <div className="delete-icon-container">
          <AlertTriangle size={48} />
        </div>
        <h1>Are you absolutely sure?</h1>
        <p className="warning-text">
          This is a permanent action and cannot be undone.
        </p>
        <div className="consequences-list">
          <p>This will permanently delete:</p>
          <ul>
            <li>Your Profile and all personal information</li>
            <li>Your Studio and all associated courses</li>
            <li>All of your posts and comments in the SquadHub</li>
          </ul>
        </div>
        <div className="delete-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/profile")}
            disabled={isDeleting}
          >
            Cancel, Keep My Account
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
