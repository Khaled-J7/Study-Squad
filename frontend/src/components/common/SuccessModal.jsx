// frontend/src/components/common/SuccessModal.jsx
import { Link } from "react-router-dom";
import { HiCheck } from "react-icons/hi";
import "./SuccessModal.css";

const SuccessModal = ({ title, message, buttonText, buttonLink }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-icon-wrapper">
          <HiCheck />
        </div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <Link to={buttonLink} className="modal-button">
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default SuccessModal;
