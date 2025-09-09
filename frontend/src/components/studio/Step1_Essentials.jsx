// frontend/src/components/studio/Step1_Essentials.jsx
import {
  HiOutlinePencilAlt,
  HiOutlineIdentification,
  HiOutlineBriefcase,
} from "react-icons/hi";
import "./CreateStudioForm.css";

// This component receives the current form data and the function to handle input changes as props.
const Step1_Essentials = ({ formData, handleInputChange }) => {
  return (
    <div className="form-step">
      {/* --- Studio Name Field --- */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          <HiOutlineIdentification /> Studio Name
        </label>
        <div className="form-input-wrapper">
          <HiOutlineIdentification className="form-input-icon" />
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            placeholder="e.g., The Creative Coding Academy"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* --- Job Title Field --- */}
      <div className="form-group">
        <label htmlFor="job_title" className="form-label">
          <HiOutlineBriefcase /> Your Professional Title
        </label>
        <div className="form-input-wrapper">
          <HiOutlineBriefcase className="form-input-icon" />
          <input
            type="text"
            id="job_title"
            name="job_title"
            className="form-input"
            placeholder="e.g., Senior Software Engineer & Mentor"
            value={formData.job_title}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* --- Description Field --- */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          <HiOutlinePencilAlt /> Studio Description
        </label>
        <div className="form-input-wrapper">
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Describe what your studio is all about. What subjects do you teach? What is your teaching style?"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default Step1_Essentials;
