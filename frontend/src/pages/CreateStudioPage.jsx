// In frontend/src/pages/CreateStudioPage.jsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import studioService from "../api/studioService";
import {
  HiOutlineIdentification,
  HiOutlinePencilAlt,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiX,
  HiCheckCircle,
  HiAcademicCap,
} from "react-icons/hi";
import SuccessModal from "../components/common/SuccessModal";
import InlineError from "../components/common/InlineError/InlineError";
import "./CreateStudioPage.css";

const CreateStudioPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cover_image: null,
    tags: [],
  });

  const [currentTag, setCurrentTag] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleClearImage = () => {
    setFormData((prev) => ({ ...prev, cover_image: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cover_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUseDefaultToggle = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      handleClearImage();
      setImagePreview("/default_cover.jpg");
      setFormData((prev) => ({ ...prev, cover_image: null }));
    } else {
      handleClearImage();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" && currentTag.trim() !== "") {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim().toLowerCase())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim().toLowerCase()],
        }));
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addSuggestedTag = (tag) => {
    if (!formData.tags.includes(tag.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag.toLowerCase()],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    const finalFormData = { ...formData };
    if (imagePreview === "/default_cover.jpg") {
      finalFormData.cover_image = null;
    }
    const response = await studioService.createStudio(finalFormData);
    if (response.success) {
      await refreshUser();
      setShowSuccessModal(true);
    } else {
      setErrors(
        response.details || { general: "An unexpected error occurred." }
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className="create-studio-page">
      <div className="studio-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <HiAcademicCap />
          </div>
          <h1>Create Your Teaching Studio</h1>
          <p>
            Transform your expertise into an engaging learning experience and
            connect with students worldwide.
          </p>
        </div>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="studio-form">
          {/* Studio Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <HiOutlineIdentification className="label-icon" />
              <div className="label-content">
                <span className="label-title">Studio Name</span>
                <span className="label-subtitle">
                  🏷️ Choose a memorable name for your teaching space.
                </span>
              </div>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., The Creative Coding Academy"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <InlineError message={errors.name} />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <HiOutlinePencilAlt className="label-icon" />
              <div className="label-content">
                <span className="label-title">Description</span>
                <span className="label-subtitle">
                  🏷️ Tell students what makes your teaching special.
                </span>
              </div>
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Share your teaching philosophy, expertise, and what students can expect..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
            <InlineError message={errors.description} />
          </div>

          {/* Cover Image */}
          <div className="form-group">
            <label className="form-label">
              <HiOutlinePhotograph className="label-icon" />
              <div className="label-content">
                <span className="label-title">Cover Image</span>
                <span className="label-subtitle">
                  🏷️ Make a great first impression (16:9 recommended).
                </span>
              </div>
            </label>
            <div
              className="file-uploader"
              onClick={() => !imagePreview && fileInputRef.current.click()}
            >
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="clear-image-btn"
                    onClick={handleClearImage}
                  >
                    <HiX />
                  </button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <HiOutlinePhotograph className="upload-icon" />
                  <span>Click to Upload Image</span>
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
            <div className="default-image-toggle">
              <input
                type="checkbox"
                id="useDefault"
                checked={imagePreview === "/default_cover.jpg"}
                onChange={handleUseDefaultToggle}
              />
              <label htmlFor="useDefault">
                Use Study Squad's default cover image.
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              <HiOutlineTag className="label-icon" />
              <div className="label-content">
                <span className="label-title">Tags & Subjects</span>
                <span className="label-subtitle">
                  🏷️ Help students discover your studio by adding relevant tags.
                </span>
              </div>
            </label>
            <div className="tags-input-container">
              {formData.tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <HiX />
                  </button>
                </div>
              ))}
              <input
                type="text"
                id="tags"
                placeholder="Type and press Enter..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
            {/* ✅ Feedback 4: More diverse tag suggestions */}
            <div className="tags-suggestions">
              <span className="suggestions-label">Popular:</span>
              {[
                "Python",
                "History",
                "Web Development",
                "Art",
                "Mathematics",
                "Business",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => addSuggestedTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <InlineError message={errors.tags} />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Creating Studio...</span>
                </>
              ) : (
                <>
                  <HiCheckCircle />
                  <span>Launch My Studio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <SuccessModal
          title="Congratulations!"
          message="Your studio is now live! You are officially a teacher on Study Squad."
          buttonText="Go to My Studio Dashboard"
          buttonLink="/my-studio"
        />
      )}
    </div>
  );
};

export default CreateStudioPage;
