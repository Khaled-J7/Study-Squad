// frontend/src/components/studio/Step2_Visuals.jsx
import { useState, useRef, useEffect } from "react";
import { HiOutlinePhotograph, HiX, HiOutlineRefresh } from "react-icons/hi";
import "./CreateStudioForm.css"; // We can reuse the same CSS

const Step2_Visuals = ({ formData, setFormData }) => {
  // --- STATE MANAGEMENT ---
  // Local state to manage the image preview URL.
  const [preview, setPreview] = useState(null);
  // Local state to track if the user wants to use the default image.
  const [useDefault, setUseDefault] = useState(false);
  // A ref to programmatically click the hidden file input.
  const fileInputRef = useRef(null);

  /**
   * Effect to set the initial state based on formData.
   * If there's an image in formData, show its preview.
   */
  useEffect(() => {
    if (formData.cover_image && typeof formData.cover_image !== "string") {
      setPreview(URL.createObjectURL(formData.cover_image));
      setUseDefault(false);
    }
  }, [formData.cover_image]);

  /**
   * Handles the selection of a new image file.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Update the main formData in the parent component.
      setFormData((prevData) => ({ ...prevData, cover_image: file }));
      // The useEffect will handle setting the preview.
      setUseDefault(false); // Uncheck the default box if a file is uploaded.
    }
  };

  /**
   * Handles the logic when the "Use default" checkbox is toggled.
   */
  const handleUseDefaultToggle = (e) => {
    const isChecked = e.target.checked;
    setUseDefault(isChecked);
    if (isChecked) {
      // If checked, clear any uploaded file from state.
      setFormData((prevData) => ({ ...prevData, cover_image: null }));
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /**
   * Clears the selected image, allowing the user to upload a new one.
   */
  const handleClearImage = () => {
    setFormData((prevData) => ({ ...prevData, cover_image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="form-step">
      <div className="form-group">
        <label className="form-label">
          <HiOutlinePhotograph /> Studio Cover Image
        </label>

        {/* --- Image Uploader and Preview Area --- */}
        <div
          className="file-uploader"
          onClick={() =>
            !preview && !useDefault && fileInputRef.current.click()
          }
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Cover preview" className="file-preview" />
              <button
                onClick={handleClearImage}
                className="clear-image-btn"
                aria-label="Clear image"
              >
                <HiX />
              </button>
            </div>
          ) : useDefault ? (
            <div className="upload-prompt is-default">
              <img
                src="/default_cover.jpg"
                alt="Default cover"
                className="file-preview"
              />
              <span>Using Study Squad Default Cover</span>
            </div>
          ) : (
            <div className="upload-prompt">
              <HiOutlinePhotograph className="upload-icon" />
              <span>Click to upload an image</span>
              <small>Recommended: 16:9 aspect ratio</small>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg"
          style={{ display: "none" }}
        />

        {/* --- Checkbox for Default Image --- */}
        <div className="form-checkbox-wrapper">
          <input
            type="checkbox"
            id="useDefaultCover"
            checked={useDefault}
            onChange={handleUseDefaultToggle}
          />
          <label htmlFor="useDefaultCover">
            No cover image? No problem. Use the Study Squad default cover.
          </label>
        </div>
      </div>
    </div>
  );
};

export default Step2_Visuals;
