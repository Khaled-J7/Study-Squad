// frontend/src/components/common/ConfirmationModal.jsx

import React from "react";
import { X, AlertTriangle } from "lucide-react";
import "./ConfirmationModal.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirmation-modal-backdrop" onClick={onClose}>
      <div
        className="confirmation-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="modal-icon">
          <AlertTriangle size={48} />
        </div>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
