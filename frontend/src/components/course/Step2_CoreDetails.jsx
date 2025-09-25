// frontend/src/components/course/Step2_CoreDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, UploadCloud, X } from "lucide-react";
import InlineError from "../common/InlineError/InlineError";
import "../../pages/dashboard/UpdateStudioPage.css";
import TagInput from "../common/TagInput";
import "./Step2_CoreDetails.css";

const Step2_CoreDetails = ({
  onNext,
  onBack,
  courseData,
  updateCourseData,
}) => {
  // State to manage local UI, like the image preview and validation errors.
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // This effect creates a preview URL when a new image file is selected.
  useEffect(() => {
    if (courseData.cover_image && typeof courseData.cover_image !== "string") {
      const previewUrl = URL.createObjectURL(courseData.cover_image);
      setImagePreview(previewUrl);
      // This is a cleanup function to prevent memory leaks.
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [courseData.cover_image]);

  // Handles changes for standard text inputs and textareas.
  const handleInputChange = (e) => {
    updateCourseData({ [e.target.name]: e.target.value });
    // Clear the error for this field when the user starts typing.
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  // Handles the selection of a new cover image.
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateCourseData({ cover_image: file });
    }
  };

  // Function to remove the selected image.
  const removeImage = () => {
    updateCourseData({ cover_image: null });
    setImagePreview(null);
    // We also need to clear the file input's value.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  //  A validation function to check for required fields.
  const validate = () => {
    const newErrors = {};
    if (!courseData.title.trim()) {
      newErrors.title = "Course title is required.";
    }
    if (!courseData.description.trim()) {
      newErrors.description = "Course description is required.";
    }
    setErrors(newErrors);
    // The form is valid if the errors object has no keys.
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      // Upon a successful validation, we just move to the next step
      onNext();
    }
  };

  return (
    <div className="step-core-details">
      <div className="step-header">
        <h1>Course Details</h1>
        <p>Provide the core information for your new course.</p>
      </div>
      <form className="update-studio-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            placeholder="e.g., Introduction to Python Programming"
          />
          <InlineError message={errors.title} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Course Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={courseData.description}
            onChange={handleInputChange}
            placeholder="A brief, engaging summary of what students will learn."
          />
          <InlineError message={errors.description} />
        </div>
        <div className="form-group">
          <label>Cover Image</label>
          <div
            className="cover-image-uploader"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg"
              style={{ display: "none" }}
            />
            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="image-preview"
                />

                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <UploadCloud size={40} />
                <p>Click to upload an image</p>
                <span>PNG or JPG</span>
              </div>
            )}
          </div>
          <p className="form-help-text">
            If no image is uploaded, a default will be applied.
          </p>
        </div>

        <TagInput
          tags={courseData.tags}
          setTags={(newTags) => updateCourseData({ tags: newTags })}
          label="Tags (e.g., Python, Beginner, Data Science)"
        />

        <div className="step-navigation">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          {/* The button is now aware of the submission state for playlists. */}
          <button
            type="button"
            className="btn-primary-main"
            onClick={handleNext}
          >
            <span>Next</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2_CoreDetails;
