// frontend/src/pages/dashboard/UpdateStudioPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import studioService from "../../api/studioService";
import Spinner from "../../components/common/Spinner";
import TagInput from "../../components/common/TagInput";
import InlineError from "../../components/common/InlineError/InlineError";
import { UploadCloud, X, Save } from "lucide-react";
import { getStudioCoverUrl } from "../../utils/helpers";
import "./UpdateStudioPage.css";

const UpdateStudioPage = () => {
  const navigate = useNavigate();
  // GET the user object from our context
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [tags, setTags] = useState([]);
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchStudioData = async () => {
        const response = await studioService.getStudioForUpdate();
        if (response.success) {
          setFormData({
            name: response.data.name,
            description: response.data.description,
          });
          setTags(response.data.tags.map((tag) => tag.name));
          // Now 'user' is guaranteed to exist here
          setCoverPreview(getStudioCoverUrl(user.studio));
        } else {
          setError(response.error);
        }
        setLoading(false);
      };
      fetchStudioData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const dismissNewCover = () => {
    setNewCoverImage(null);
    setCoverPreview(getStudioCoverUrl(user.studio));
  };

  // ✅ THE FIX: The handleSubmit function is now a two-step process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError({});
    let allSucceeded = true;

    // --- Step 1: Update Text Details ---
    const detailsData = {
      name: formData.name,
      description: formData.description,
      tag_names: tags,
    };
    const detailsResponse = await studioService.updateStudio(detailsData);
    if (!detailsResponse.success) {
      setError(
        detailsResponse.error || { general: "Failed to update studio details." }
      );
      allSucceeded = false;
    }

    // --- Step 2: Update Cover Image (only if a new one was selected) ---
    if (allSucceeded && newCoverImage) {
      const coverResponse = await studioService.updateCoverImage(newCoverImage);
      if (!coverResponse.success) {
        setError((prev) => ({ ...prev, ...coverResponse.error }));
        allSucceeded = false;
      }
    }

    // --- Step 3: Finalize ---
    if (allSucceeded) {
      await refreshUser();
      navigate("/my-studio");
    }
    setIsSubmitting(false);
  };

  // We also check if the user exists before rendering the form
  if (loading || !user) return <Spinner />;
  if (error && !isSubmitting) return <InlineError message={error} />;

  return (
    <div className="update-studio-page">
      <div className="update-form-header">
        <h1>Update Your Studio</h1>
        <p>Keep your studio information fresh and up-to-date.</p>
      </div>
      <div className="update-form-container">
        <form onSubmit={handleSubmit} className="update-studio-form">
          <div className="form-group">
            <label htmlFor="name">Studio Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Studio Description</label>
            <textarea
              id="description"
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Studio Cover Image</label>
            <div className="cover-image-uploader">
              <div className="cover-image-preview">
                {newCoverImage && (
                  <button
                    type="button"
                    className="dismiss-btn"
                    onClick={dismissNewCover}
                  >
                    <X size={16} />
                  </button>
                )}
                <img src={coverPreview} alt="Cover preview" />
              </div>
              <div className="uploader-cta">
                <label htmlFor="cover_image" className="uploader-label">
                  <UploadCloud size={20} />
                  <span className="uploader-text">
                    {newCoverImage
                      ? `Selected: ${newCoverImage.name}`
                      : "Change Cover"}
                  </span>
                </label>
                <input
                  id="cover_image"
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="uploader-input"
                />
              </div>
            </div>
            {error?.cover_image && <InlineError message={error.cover_image} />}
          </div>
          <div className="form-group">
            <TagInput tags={tags} setTags={setTags} label="Tags" />
          </div>
          {error && typeof error === "string" && (
            <InlineError message={error} />
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              <Save size={20} />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStudioPage;
