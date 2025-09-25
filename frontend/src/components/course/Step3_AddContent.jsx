// frontend/src/components/course/Step3_AddContent.jsx
import React, { useRef, useState } from "react";
import { ArrowLeft, CheckCircle, FileUp, Video, X } from "lucide-react";
import InlineError from "../common/InlineError/InlineError";
import MDXEditorComponent from "../common/MDXEditorComponent";
import "./Step3_AddContent.css";

/**
 * This is the third and final step of the course creation form.
 * It dynamically displays the correct input field for the course content
 * based on the 'lesson_type' chosen in the first step.
 */
const Step3_AddContent = ({
  onBack,
  courseData,
  updateCourseData,
  onSubmit,
  isSubmitting,
}) => {
  // We only need refs and state for the content types that actually exist.
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);

  /**
   * This function handles the video file selection and validates its size.
   */
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_VIDEO_SIZE_MB = 200;
    const MAX_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`Video file cannot exceed ${MAX_VIDEO_SIZE_MB}MB.`);
      updateCourseData({ lesson_video: null });
    } else {
      setFileError(null);
      updateCourseData({ lesson_video: file });
    }
  };

  /**
   * These "dismiss" functions handle the removal of a selected file.
   */
  const removeFile = () => {
    updateCourseData({ lesson_file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeVideo = () => {
    updateCourseData({ lesson_video: null });
    if (videoInputRef.current) videoInputRef.current.value = "";
    setFileError(null);
  };

  // This function decides which input field to show.
  const renderContentInput = () => {
    switch (courseData.lesson_type) {
      case "markdown":
        return (
          <div className="form-group">
            <label>Course Content</label>
            <MDXEditorComponent
              markdown={courseData.markdown_content}
              onChange={(value) =>
                updateCourseData({ markdown_content: value })
              }
            />
          </div>
        );

      case "file":
        return (
          <div className="form-group">
            <label>Upload Course File</label>
            <div
              className="file-uploader"
              onClick={() =>
                !courseData.lesson_file && fileInputRef.current.click()
              }
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                  updateCourseData({ lesson_file: e.target.files[0] })
                }
                style={{ display: "none" }}
              />
              <div className="upload-placeholder">
                {courseData.lesson_file ? (
                  <div className="file-success-message">
                    <CheckCircle size={40} className="success-icon" />
                    <p>
                      File Selected:{" "}
                      <strong>{courseData.lesson_file.name}</strong>
                    </p>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={removeFile}
                    >
                      <X size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <FileUp size={40} />
                    <p>Click to upload your course file</p>
                    <span>PDF, DOCX, TXT, etc.</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="form-group">
            <label>Upload Course Video</label>
            <div
              className="file-uploader"
              onClick={() =>
                !courseData.lesson_video && videoInputRef.current.click()
              }
            >
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                style={{ display: "none" }}
                accept="video/mp4,video/x-m4v,video/*"
              />
              <div className="upload-placeholder">
                {courseData.lesson_video ? (
                  <div className="file-success-message">
                    <CheckCircle size={40} className="success-icon" />
                    <p>
                      Video Selected:{" "}
                      <strong>{courseData.lesson_video.name}</strong>
                    </p>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={removeVideo}
                    >
                      <X size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Video size={40} />
                    <p>Click to upload your course video</p>
                  </>
                )}
              </div>
            </div>
            <p className="form-help-text">Maximum file size: 200MB.</p>
            <InlineError message={fileError} />
          </div>
        );

      default:
        // The 'playlist' case has been completely removed.
        return <p>Invalid course type selected. Please go back.</p>;
    }
  };

  return (
    <div className="step-add-content">
      <div className="step-header">
        <h1>Add Your Content</h1>
        <p>This is the final step. Add the core material for your course.</p>
      </div>

      {/* The form is now simpler as it doesn't need a special case for playlists. */}
      <form onSubmit={onSubmit} className="update-studio-form">
        {renderContentInput()}
        <div className="step-navigation">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <button
            type="submit"
            className="btn-primary-main"
            disabled={isSubmitting}
          >
            <CheckCircle size={18} />
            <span>
              {isSubmitting ? "Creating Course..." : "Finish & Create Course"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3_AddContent;
