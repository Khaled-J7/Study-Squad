// frontend/src/components/dashboard/CourseManagementCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, PlayCircle, Trash2, AlertTriangle } from "lucide-react";
import { getCourseCoverUrl } from "../../utils/helpers";
import "./CourseManagementCard.css";

/**
 * The intelligent course card for the teacher's dashboard.
 * It displays different actions based on the course type.
 * @param {Object} props
 * @param {Object} props.lesson - The course data.
 * @param {Function} props.onDelete - The handler function to delete the course.
 */
const CourseManagementCard = ({
  lesson,
  onDelete,
  onPreview,
  isPublicView = false,
}) => {
  // We add local state to this component to manage the delete confirmation dialog.
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const coverImageUrl = getCourseCoverUrl(lesson);

  const handleDeleteClick = () => {
    // When the user clicks the trash icon, we open the confirmation dialog.
    setIsConfirmingDelete(true);
  };

  const confirmDelete = () => {
    // If the user confirms, we call the onDelete function passed down from the parent.
    onDelete(lesson.id);
    setIsConfirmingDelete(false);
  };

  const cancelDelete = () => {
    // If the user cancels, we just close the dialog.
    setIsConfirmingDelete(false);
  };

  return (
    <div className="course-mgmt-card">
      {/* --- The Delete Confirmation Modal --- */}
      {/* This modal only appears when isConfirmingDelete is true. */}
      {isConfirmingDelete && (
        <div className="delete-confirmation-backdrop">
          <div className="delete-confirmation-modal">
            <AlertTriangle size={48} className="confirmation-icon" />
            <h3>Are you sure?</h3>
            <p>
              This course will be permanently deleted. This action cannot be
              undone.
            </p>
            <div className="confirmation-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- The Card Content --- */}
      <div onClick={onPreview} className="course-mgmt-cover-link">
        <img
          src={coverImageUrl}
          alt={lesson.title}
          className="course-mgmt-cover"
        />
        <div className="course-type-badge">
          {lesson.lesson_type === "video"
            ? "Video"
            : lesson.lesson_type === "file"
            ? "File"
            : "Article"}
        </div>
      </div>

      <div className="course-mgmt-info">
        <h4 className="course-mgmt-title">{lesson.title}</h4>
        <p className="course-mgmt-desc">{lesson.description}</p>
        <div className="course-mgmt-actions">
          {/* These actions are now conditional based on the isPublicView prop */}
          {!isPublicView ? (
            <>
              <Link
                to={`/my-studio/courses/${lesson.id}/edit`}
                className="action-btn edit"
              >
                <Edit size={14} />
                <span>Edit</span>
              </Link>
              {/* ✅ --- Conditional Rendering Logic --- */}
              {/* We check the lesson_type to decide which button to show. */}
              {/* ✅ The buttons now call the 'onPreview' function to open the modal. */}
              {lesson.lesson_type === "video" ? (
                <button onClick={onPreview} className="action-btn play">
                  <PlayCircle size={14} />
                  <span>Play</span>
                </button>
              ) : (
                <button onClick={onPreview} className="action-btn view">
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
              )}

              <button className="action-btn delete" onClick={handleDeleteClick}>
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            // Optionally, add a public-facing button like "View Course"
            // For now, we'll just show a simple preview button
            <button onClick={onPreview} className="action-btn view-public">
              <Eye size={14} />
              <span>View Course</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManagementCard;
