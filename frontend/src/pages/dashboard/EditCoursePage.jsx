// frontend/src/pages/dashboard/EditCoursePage.jsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UploadCloud, X } from "lucide-react";
import studioService from "../../api/studioService";
import Spinner from "../../components/common/Spinner";
import TagInput from "../../components/common/TagInput";
import MDXEditorComponent from "../../components/common/MDXEditorComponent";
import InlineError from "../../components/common/InlineError/InlineError";
import { getCourseCoverUrl } from "../../utils/helpers";
import "./EditCoursePage.css";

const EditCoursePage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [tags, setTags] = useState([]);
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [newCoverPreview, setNewCoverPreview] = useState("");
  const [newLessonFile, setNewLessonFile] = useState(null);
  const [newLessonVideo, setNewLessonVideo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await studioService.getCourseDetail(lessonId);
        if (response.success) {
          // We intercept the incoming data before setting the state.
          const fetchedData = response.data;

          // If markdown_content is null (from the database), we convert it
          // to an empty string right here. This ensures our state is always clean.
          if (fetchedData.markdown_content === null) {
            fetchedData.markdown_content = "";
          }

          // Now we can safely set the state, knowing it contains no nulls.
          setCourseData(fetchedData);
          setTags(fetchedData.tags || []);
        } else {
          setError("Failed to load course data.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [lessonId]);

  // --- All other handler functions remain the same ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverImage(file);
      setNewCoverPreview(URL.createObjectURL(file));
    }
  };

  const dismissNewCoverImage = () => {
    setNewCoverImage(null);
    setNewCoverPreview("");
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      if (name === "lesson_file") setNewLessonFile(files[0]);
      if (name === "lesson_video") setNewLessonVideo(files[0]);
    }
  };

  const handleMarkdownChange = useCallback((markdown) => {
    setCourseData((prev) => ({ ...prev, markdown_content: markdown }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    tags.forEach((tag) => formData.append("tags", tag));

    if (newCoverImage) formData.append("cover_image", newCoverImage);
    if (newLessonFile) formData.append("lesson_file", newLessonFile);
    if (newLessonVideo) formData.append("lesson_video", newLessonVideo);
    if (courseData.lesson_type === "markdown") {
      formData.append("markdown_content", courseData.markdown_content || "");
    }

    const response = await studioService.updateCourse(lessonId, formData);

    if (response.success) {
      navigate("/my-studio/courses");
    } else {
      setValidationErrors(response.error || {});
    }
    setIsSubmitting(false);
  };

  const renderContentEditor = () => {
    switch (courseData?.lesson_type) {
      case "markdown":
        return (
          <div className="form-group">
            <label>Lesson Content</label>
            <MDXEditorComponent
              markdown={courseData.markdown_content || ""}
              onChange={handleMarkdownChange}
            />
            <InlineError message={validationErrors.markdown_content} />
          </div>
        );
      case "file":
      case "video":
        const isVideo = courseData.lesson_type === "video";
        const currentFile = isVideo
          ? courseData.lesson_video
          : courseData.lesson_file;
        const newFile = isVideo ? newLessonVideo : newLessonFile;
        return (
          <div className="form-group">
            <label>{isVideo ? "Lesson Video" : "Lesson File"}</label>
            <div className="custom-file-uploader">
              <label
                htmlFor={isVideo ? "lesson_video" : "lesson_file"}
                className="uploader-label"
              >
                <UploadCloud size={24} />
                <span className="uploader-text">
                  {newFile
                    ? `Selected: ${newFile.name}`
                    : currentFile
                    ? `Current: ${currentFile.split("/").pop()}`
                    : `Choose a ${isVideo ? "video" : "file"}`}
                </span>
              </label>
              <input
                id={isVideo ? "lesson_video" : "lesson_file"}
                type="file"
                name={isVideo ? "lesson_video" : "lesson_file"}
                accept={isVideo ? "video/*" : "*/*"}
                onChange={handleFileChange}
                className="uploader-input"
              />
            </div>
            <InlineError
              message={
                validationErrors[isVideo ? "lesson_video" : "lesson_file"]
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  // --- RENDER LOGIC ---

  // Now we must also check if courseData exists before rendering the form
  if (loading || !courseData)
    return (
      <div className="edit-course-container">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="edit-course-container">
        <p className="error-message">{error}</p>
      </div>
    );

  return (
    <div className="edit-course-container">
      <div className="edit-course-header">
        <h1>Edit Course</h1>
        <p>
          You are editing: <strong>{courseData.title}</strong>
        </p>
      </div>
      <form onSubmit={handleSubmit} className="edit-course-form">
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleInputChange}
            required
          />
          <InlineError message={validationErrors.title} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Course Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={courseData.description}
            onChange={handleInputChange}
          />
          <InlineError message={validationErrors.description} />
        </div>

        {/* ✅ FINAL FIX & UPGRADE: Cover Image Uploader */}
        <div className="form-group">
          <label>Cover Image</label>
          <div className="cover-image-uploader">
            <div className="cover-image-preview">
              {newCoverPreview && (
                <button
                  type="button"
                  className="dismiss-btn"
                  onClick={dismissNewCoverImage}
                >
                  <X size={16} />
                </button>
              )}
              <img
                src={newCoverPreview || getCourseCoverUrl(courseData)}
                alt="Cover preview"
              />
            </div>
            <div className="uploader-cta">
              <label htmlFor="cover_image" className="uploader-label">
                <UploadCloud size={20} />
                <span className="uploader-text">
                  {newCoverImage
                    ? `Selected: ${newCoverImage.name}`
                    : "Change Cover Image"}
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
          <InlineError message={validationErrors.cover_image} />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <TagInput tags={tags} setTags={setTags} />
          <InlineError message={validationErrors.tags} />
        </div>

        {renderContentEditor()}

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/my-studio/courses")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
