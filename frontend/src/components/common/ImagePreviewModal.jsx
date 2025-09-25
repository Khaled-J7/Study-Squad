// frontend/src/components/common/ImagePreviewModal.jsx
import React, { useEffect } from "react";
import { X } from "lucide-react";
import "./ImagePreviewModal.css";

const ImagePreviewModal = ({ imageUrl, onClose }) => {
  // Effect to handle closing the modal with the Escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscKey);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={28} />
        </button>
        <img src={imageUrl} alt="Cover Preview" className="modal-image" />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
