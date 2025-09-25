// frontend/src/pages/dashboard/MyCoursesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studioService from "../../api/studioService";
import CourseViewerModal from "../../components/dashboard/CourseViewerModal";
import Spinner from "../../components/common/Spinner";
import InlineError from "../../components/common/InlineError/InlineError";
import CourseManagementCard from "../../components/dashboard/CourseManagementCard";
import { BookOpen, PlusCircle } from "lucide-react";
import "./MyCoursesPage.css";

const MyCoursesPage = () => {
  // State for storing the list of courses fetched from the API.
  const [courses, setCourses] = useState([]);
  // Standard states for managing the data fetching lifecycle.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This state now only stores the ID of the course to view.
  const [viewingCourseId, setViewingCourseId] = useState(null);

  // Data Fetching Function
  const fetchCourses = async () => {
    setLoading(true);
    const response = await studioService.getMyCourses();
    if (response.success) {
      setCourses(response.data);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /**
   * ✅ NEW: Handler function for deleting a course.
   * This function will be passed down to each CourseManagementCard.
   * @param {number} lessonId - The ID of the course to delete.
   */
  const handleDeleteCourse = async (lessonId) => {
    const response = await studioService.deleteCourse(lessonId);
    if (response.success) {
      // If deletion is successful, we re-fetch the course list to update the UI.
      fetchCourses();
    } else {
      alert(response.error);
    }
  };

  // While the data is being fetched, we show a spinner.
  if (loading) {
    return <Spinner />;
  }

  // If there was an error during fetching, we display it.
  if (error) {
    return <InlineError message={error} />;
  }

  return (
    <>
      <div className="my-courses-page">
        <div className="page-header">
          <h1>My Courses</h1>
          <p>
            Manage all your courses in one place. Edit existing content or
            create something new.
          </p>
        </div>

        {/* This is the main conditional rendering logic. */}
        {courses.length > 0 ? (
          // If the teacher HAS courses, we display them in a grid.
          <div className="courses-grid-container">
            {courses.map((course) => (
              <CourseManagementCard
                key={course.id}
                lesson={course}
                onDelete={handleDeleteCourse}
                // We now pass the ID to the preview handler.
                onPreview={() => setViewingCourseId(course.id)}
              />
            ))}
          </div>
        ) : (
          // If the teacher has NO courses, we display the professional "empty state".
          <div className="empty-state-container">
            <div className="empty-state-icon">
              <BookOpen size={48} />
            </div>
            <h2 className="empty-state-title">
              Your Studio is Ready for a Masterpiece
            </h2>
            <p className="empty-state-text">
              You haven't created any courses yet. This is your canvas to share
              your knowledge with the world.
            </p>
            <Link to="/my-studio/courses/new" className="btn-primary-main">
              <PlusCircle size={20} />
              <span>Create Your First Course</span>
            </Link>
          </div>
        )}
      </div>
      {/* ✅ The modal now receives the ID and handles its own data fetching. */}
      {viewingCourseId && (
        <CourseViewerModal
          lessonId={viewingCourseId}
          onClose={() => setViewingCourseId(null)}
        />
      )}
    </>
  );
};

export default MyCoursesPage;
