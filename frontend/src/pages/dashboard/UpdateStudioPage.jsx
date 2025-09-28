// frontend/src/pages/dashboard/UpdateStudioPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import studioService from "../../api/studioService";
import Spinner from "../../components/common/Spinner";
import TagInput from "../../components/common/TagInput";
import InlineError from "../../components/common/InlineError/InlineError";
import { Save } from "lucide-react";
import "./UpdateStudioPage.css";

const UpdateStudioPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [tags, setTags] = useState([]);
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

  // ✅ SIMPLIFIED: Only update text details now
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const detailsData = {
      name: formData.name,
      description: formData.description,
      tag_names: tags,
    };

    const response = await studioService.updateStudio(detailsData);

    if (response.success) {
      await refreshUser();
      navigate("/my-studio");
    } else {
      setError(response.error || "Failed to update studio details.");
    }

    setIsSubmitting(false);
  };

  if (loading || !user) return <Spinner />;

  return (
    <div className="update-studio-page">
      <div className="update-form-header">
        <h1>Update Your Studio</h1>
        <p>Keep your studio information fresh and up-to-date.</p>
        {/* ✅ ADDED: Inform users about cover image update location */}
        <p className="update-note">
          <strong>Note:</strong> You can update your studio cover image from the
          main dashboard.
        </p>
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

          {/* ✅ REMOVED: Entire cover image section */}

          <div className="form-group">
            <TagInput tags={tags} setTags={setTags} label="Tags" />
          </div>

          {error && <InlineError message={error} />}

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
