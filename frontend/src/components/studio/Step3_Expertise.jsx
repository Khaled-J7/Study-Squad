// frontend/src/components/studio/Step3_Expertise.jsx
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineTag,
  HiX,
  HiPaperClip,
  HiCheckCircle,
  HiDocumentText,
  HiUpload,
} from "react-icons/hi";
import "./CreateStudioForm.css";

const Step3_Expertise = ({ formData, setFormData }) => {
  // --- STATE MANAGEMENT ---
  // Get the currently logged-in user from our global context to check for existing credentials.
  const { user } = useAuth();

  // Local state to manage the text input for the tags feature.
  const [currentTag, setCurrentTag] = useState("");

  // Local state to manage the inputs for a single, new degree before it's added to the list.
  const [currentDegree, setCurrentDegree] = useState({ name: "", file: null });

  // Local state to manage the inputs for a single, new experience before it's added to the list.
  const [currentExperience, setCurrentExperience] = useState({
    title: "",
    company: "",
  });

  // Refs to programmatically click the hidden file inputs.
  const cvFileInputRef = useRef(null);
  const degreeFileInputRef = useRef(null);

  // --- HANDLER FUNCTIONS ---

  /**
   * Updates the main formData when a user selects a CV file.
   */
  const handleCVFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cv_file: file }));
    }
  };

  /**
   * Updates the local currentDegree state when a user selects a degree file.
   */
  const handleDegreeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentDegree((prev) => ({ ...prev, file: file }));
    }
  };

  /**
   * Adds the currently entered degree and file to the main formData's `degrees` array.
   */
  const addDegree = () => {
    if (currentDegree.name.trim() !== "" && currentDegree.file) {
      setFormData((prev) => ({
        ...prev,
        degrees: [...prev.degrees, currentDegree],
      }));
      // Reset the local state and the file input for the next entry.
      setCurrentDegree({ name: "", file: null });
      if (degreeFileInputRef.current) {
        degreeFileInputRef.current.value = "";
      }
    } else {
      alert("Please provide both a degree name and attach a file.");
    }
  };

  /**
   * Removes a newly added degree from the list before final submission.
   */
  const removeNewDegree = (degreeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      degrees: prev.degrees.filter((d) => d.name !== degreeToRemove.name),
    }));
  };

  /**
   * Adds a new tag to the list when the user presses "Enter".
   */
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim() !== "") {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  /**
   * Removes a tag from the list.
   */
  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  /**
   * Updates the local state for the professional experience inputs.
   */
  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    setCurrentExperience((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Adds the currently entered experience to the main formData.
   */
  const addExperience = () => {
    if (
      currentExperience.title.trim() !== "" &&
      currentExperience.company.trim() !== ""
    ) {
      setFormData((prev) => ({
        ...prev,
        experience: [...prev.experience, currentExperience],
      }));
      setCurrentExperience({ title: "", company: "" });
    }
  };

  /**
   * Removes an experience item from the list.
   */
  const removeExperience = (expToRemove) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp !== expToRemove),
    }));
  };

  return (
    <div className="form-step">
      {/* --- Section 1: Display Existing Credentials from Profile --- */}
      <div className="credentials-summary">
        <h4>Credentials from Your Profile</h4>
        {user?.profile?.degrees?.length > 0 || user?.profile?.cv_file ? (
          <ul className="credentials-list">
            {user.profile.cv_file && (
              <li>
                <HiCheckCircle className="check-icon" /> CV / Resume on file
              </li>
            )}
            {user.profile.degrees.map((degree) => (
              <li key={degree.id}>
                <HiCheckCircle className="check-icon" /> {degree.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            Your profile has no credentials yet. You can add them here to
            strengthen your studio's credibility.
          </p>
        )}
      </div>

      {/* --- Section 2: Upload CV (Only shows if no CV exists on profile) --- */}
      {!user?.profile?.cv_file && (
        <div className="form-group">
          <label className="form-label">
            <HiDocumentText /> Upload CV / Resume (Optional)
          </label>
          <div
            className="file-uploader"
            onClick={() => cvFileInputRef.current.click()}
          >
            {formData.cv_file ? (
              <div className="upload-prompt">
                <HiCheckCircle className="upload-icon" />
                <span>{formData.cv_file.name}</span>
                <small>Ready for submission</small>
              </div>
            ) : (
              <div className="upload-prompt">
                <HiUpload className="upload-icon" />
                <span>Click to upload your CV</span>
                <small>PDF, DOC, DOCX up to 5MB</small>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={cvFileInputRef}
            onChange={handleCVFileChange}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx"
          />
        </div>
      )}

      {/* --- Section 3: Add New Degrees --- */}
      <div className="form-group">
        <label className="form-label">
          <HiOutlineAcademicCap /> Add Degrees / Certifications
        </label>
        <div>
          {formData.degrees.map((degree, index) => (
            <div key={index} className="dynamic-list-item">
              <div>
                <span className="list-item-text-bold">{degree.name}</span>
                <span className="list-item-text-secondary">
                  <HiPaperClip /> {degree.file.name}
                </span>
              </div>
              <button
                onClick={() => removeNewDegree(degree)}
                className="list-remove-btn"
              >
                <HiX />
              </button>
            </div>
          ))}
        </div>
        <div className="degree-input-group">
          <input
            type="text"
            className="form-input"
            placeholder="e.g., B.Sc. in Computer Science"
            value={currentDegree.name}
            onChange={(e) =>
              setCurrentDegree((prev) => ({ ...prev, name: e.target.value }))
            }
            style={{ paddingLeft: "1rem" }}
          />
          <button
            type="button"
            className={`btn-inline-action btn-attach ${
              currentDegree.file ? "is-selected" : ""
            }`}
            onClick={() => degreeFileInputRef.current.click()}
          >
            {currentDegree.file ? <HiCheckCircle /> : <HiPaperClip />}
            {currentDegree.file ? "File Selected" : "Attach File"}
          </button>
          <input
            type="file"
            ref={degreeFileInputRef}
            onChange={handleDegreeFileChange}
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <button
            type="button"
            onClick={addDegree}
            className="btn-inline-action btn-add"
          >
            Add
          </button>
        </div>
      </div>

      {/* --- Section 4: Tags --- */}
      <div className="form-group">
        <label htmlFor="tags" className="form-label">
          <HiOutlineTag /> Subjects / Tags
        </label>
        <div className="tags-container">
          {formData.tags.map((tag, index) => (
            <div key={index} className="tag-item">
              <span>{tag}</span>
              <button onClick={() => removeTag(tag)} className="tag-remove-btn">
                <HiX />
              </button>
            </div>
          ))}
          <input
            type="text"
            id="tags"
            className="form-input"
            placeholder="Type a tag and press Enter..."
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            style={{ paddingLeft: "1rem", border: "none", flexGrow: 1 }}
          />
        </div>
      </div>

      {/* --- Section 5: Professional Experience --- */}
      <div className="form-group">
        <label className="form-label">
          <HiOutlineBriefcase /> Professional Experience
        </label>
        <div className="degree-input-group" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            name="title"
            className="form-input"
            placeholder="Job Title"
            value={currentExperience.title}
            onChange={handleExperienceChange}
            style={{ paddingLeft: "1rem" }}
          />
          <input
            type="text"
            name="company"
            className="form-input"
            placeholder="Company / Organization"
            value={currentExperience.company}
            onChange={handleExperienceChange}
            style={{ paddingLeft: "1rem" }}
          />
          <button
            type="button"
            onClick={addExperience}
            className="btn-inline-action btn-add"
          >
            Add
          </button>
        </div>
        <div>
          {formData.experience.map((exp, index) => (
            <div key={index} className="dynamic-list-item">
              <div>
                <span className="list-item-text-bold">{exp.title}</span>
                <span className="list-item-text-secondary">
                  {" "}
                  at {exp.company}
                </span>
              </div>
              <button
                onClick={() => removeExperience(exp)}
                className="list-remove-btn"
              >
                <HiX />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step3_Expertise;
