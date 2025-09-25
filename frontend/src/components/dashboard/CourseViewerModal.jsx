// frontend/src/components/dashboard/CourseViewerModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Expand, Download, Minimize } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getCourseCoverUrl } from "../../utils/helpers";
import studioService from "../../api/studioService"; // Import the service
import Spinner from "../common/Spinner";
import InlineError from "../common/InlineError/InlineError";
import "./CourseViewerModal.css";

/**
 * A modal that is now self-sufficient. It receives a lessonId and
 * fetches its own detailed content.
 */
const CourseViewerModal = ({ lessonId, onClose }) => {
  const API_BASE_URL = "http://127.0.0.1:8000";

  // This component now has its own state to manage the fetched data.
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to track if we are currently in fullscreen mode.
  const [isFullscreen, setIsFullscreen] = useState(false);
  // We use a ref to target the markdown container for fullscreen mode.
  const markdownRef = useRef(null);

  /**
   * ✅ NEW: This useEffect hook listens for the browser's native fullscreen change event.
   * This is the most reliable way to know if we've entered or exited fullscreen,
   * for example, by the user pressing the 'Esc' key.
   */
  useEffect(() => {
    const onFullscreenChange = () => {
      // document.fullscreenElement will be the element in fullscreen, or null if not.
      // We update our state to match.
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    // We must clean up the event listener when the component unmounts.
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // This effect runs when the modal opens (when lessonId changes).
  useEffect(() => {
    const fetchLessonDetail = async () => {
      setLoading(true);
      const response = await studioService.getCourseDetail(lessonId);
      if (response.success) {
        setLesson(response.data);
      } else {
        setError(response.error);
      }
      setLoading(false);
    };

    fetchLessonDetail();
  }, [lessonId]);

  /**
   * The handler is now a toggle.
   * It checks if we are already in fullscreen and calls the appropriate browser API.
   */
  const handleFullscreenToggle = () => {
    if (!markdownRef.current) return;

    if (isFullscreen) {
      // If we are already fullscreen, exit.
      document.exitFullscreen();
    } else {
      // Otherwise, request fullscreen on our markdown container.
      markdownRef.current.requestFullscreen();
    }
  };

  // Handler to download the markdown content as a .md file.
  const handleDownloadMarkdown = () => {
    const blob = new Blob([lesson.markdown_content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lesson.title.replace(/\s+/g, "_")}.md`; // Create a clean filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderLessonContent = () => {
    // We now have all the data we need, so these checks will work correctly.
    switch (lesson.lesson_type) {
      case "markdown":
        return (
          // We wrap the markdown in a div with our ref.
          <div className="markdown-content-wrapper" ref={markdownRef}>
            <div className="markdown-actions">
              <button onClick={handleFullscreenToggle}>
                {isFullscreen ? <Minimize size={16}/> : <Expand size={16}/>}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
              <button onClick={handleDownloadMarkdown}>
                <Download size={16} /> Download as .md
              </button>
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{lesson.markdown_content}</ReactMarkdown>
            </div>
          </div>
        );
      case "file":
        // The '.split' will now work because 'lesson.lesson_file' exists.
        return (
          <div className="file-content">
            <a
              href={`${API_BASE_URL}${lesson.lesson_file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-main"
            >
              Download File
            </a>
            <p>File: {lesson.lesson_file.split("/").pop()}</p>
          </div>
        );
      case "video":
        return (
          <div className="video-content">
            <video
              controls
              autoPlay
              src={`${API_BASE_URL}${lesson.lesson_video}`}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      default:
        return <p>This lesson type cannot be previewed.</p>;
    }
  };

  return (
    <div className="course-viewer-backdrop" onClick={onClose}>
      <div className="course-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <X size={28} />
        </button>
        {loading ? (
          <Spinner />
        ) : error ? (
          <InlineError message={error} />
        ) : lesson ? (
          <>
            <div className="modal-header">
              <img
                src={getCourseCoverUrl(lesson)}
                alt={lesson.title}
                className="modal-cover-image"
              />
              <div className="modal-title-overlay">
                <h2>{lesson.title}</h2>
              </div>
            </div>
            <div className="modal-body">{renderLessonContent()}</div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CourseViewerModal;
