// frontend/src/pages/dashboard/UpdateStudioPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studioService from "../../api/studioService";
import Spinner from "../../components/common/Spinner";
import TagInput from "../../components/common/TagInput";
import InlineError from "../../components/common/InlineError/InlineError";
import { Save } from "lucide-react";
import "./UpdateStudioPage.css"; // The ONLY stylesheet we will use.

const UpdateStudioPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      tag_names: tags,
    };
    const response = await studioService.updateStudio(dataToSubmit);
    if (response.success) {
      navigate("/my-studio");
    } else {
      setError(response.error || "An unknown error occurred.");
    }
    setIsSubmitting(false);
  };

  if (loading) return <Spinner />;
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
            <TagInput
              tags={tags}
              setTags={setTags} // We pass the state and setter directly
              label="Tags"
            />
          </div>

          {error && isSubmitting && <InlineError message={error} />}
          
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
