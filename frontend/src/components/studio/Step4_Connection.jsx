// frontend/src/components/studio/Step4_Connection.jsx
import { SiGmail, SiLinkedin, SiX } from "react-icons/si";
import "./CreateStudioForm.css";

const Step4_Connection = ({ formData, setFormData }) => {
  // A special handler for the social_links object.
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    // We update the nested social_links object within our main formData.
    setFormData((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [name]: value,
      },
    }));
  };

  return (
    <div className="form-step">
      {/* --- Gmail Field --- */}
      <div className="form-group">
        <label htmlFor="gmail" className="form-label">
          <SiGmail /> Contact Email (Gmail)
        </label>
        <div className="form-input-wrapper">
          <SiGmail className="form-input-icon" />
          <input
            type="email"
            id="gmail"
            name="email" // This key will go inside the social_links object
            className="form-input"
            placeholder="your.email@gmail.com"
            value={formData.social_links.email || ""}
            onChange={handleSocialChange}
            required
          />
        </div>
      </div>

      {/* --- LinkedIn Field --- */}
      <div className="form-group">
        <label htmlFor="linkedin" className="form-label">
          <SiLinkedin /> LinkedIn Profile URL
        </label>
        <div className="form-input-wrapper">
          <SiLinkedin className="form-input-icon" />
          <input
            type="url"
            id="linkedin"
            name="linkedin"
            className="form-input"
            placeholder="https://www.linkedin.com/in/your-profile"
            value={formData.social_links.linkedin || ""}
            onChange={handleSocialChange}
          />
        </div>
      </div>

      {/* --- Twitter Field --- */}
      <div className="form-group">
        <label htmlFor="twitter" className="form-label">
          <SiX /> X Profile URL
        </label>
        <div className="form-input-wrapper">
          <SiX className="form-input-icon" />
          <input
            type="url"
            id="twitter"
            name="twitter"
            className="form-input"
            placeholder="https://twitter.com/your-handle"
            value={formData.social_links.twitter || ""}
            onChange={handleSocialChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Step4_Connection;
