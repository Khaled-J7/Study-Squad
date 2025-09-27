// frontend/src/pages/dashboard/MyCoursesPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import studioService from "../../api/studioService";
import CourseViewerModal from "../../components/dashboard/CourseViewerModal";
import Spinner from "../../components/common/Spinner";
import InlineError from "../../components/common/InlineError/InlineError";
import CourseManagementCard from "../../components/dashboard/CourseManagementCard";
import { BookOpen, PlusCircle, Search, Grid, List } from "lucide-react";
import "./MyCoursesPage.css";

const MyCoursesPage = () => {
  // State for storing the list of courses fetched from the API.
  const [courses, setCourses] = useState([]);
  // Standard states for managing the data fetching lifecycle.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

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

  const handleDeleteCourse = async (lessonId) => {
    const response = await studioService.deleteCourse(lessonId);
    if (response.success) {
      fetchCourses();
    } else {
      alert(response.error);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // While the data is being fetched, we show a spinner.
  if (loading) {
    return (
      <div className="my-courses-page">
        <div className="page-header">
          <h1>My Courses</h1>
        </div>
        <Spinner />
      </div>
    );
  }

  // If there was an error during fetching, we display it.
  if (error) {
    return (
      <div className="my-courses-page">
        <div className="page-header">
          <h1>My Courses</h1>
        </div>
        <InlineError message={error} />
      </div>
    );
  }

  return (
    <>
      <div className="my-courses-page">
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>My Courses</h1>
              <p>
                Manage all your courses in one place. Edit existing content or
                create something new.
              </p>
            </div>
            <Link
              to="/my-studio/courses/new"
              className="btn-primary-main pink-btn"
            >
              <PlusCircle size={20} />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        {courses.length > 0 && (
          <div className="courses-controls">
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search courses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Course Count */}
        {courses.length > 0 && (
          <div className="courses-stats">
            <span className="courses-count">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1 ? "course" : "courses"} found
              {searchTerm && ` for "${searchTerm}"`}
            </span>
          </div>
        )}

        {/* This is the main conditional rendering logic. */}
        {filteredCourses.length > 0 ? (
          // If the teacher HAS courses, we display them in a grid or list.
          <div className={`courses-container ${viewMode}-view`}>
            {filteredCourses.map((course) => (
              <CourseManagementCard
                key={course.id}
                lesson={course}
                onDelete={handleDeleteCourse}
                onPreview={() => setViewingCourseId(course.id)}
              />
            ))}
          </div>
        ) : searchTerm ? (
          // No results for search
          <div className="no-results-container">
            <div className="no-results-icon">
              <Search size={48} />
            </div>
            <h2 className="no-results-title">No courses found</h2>
            <p className="no-results-text">
              No courses match your search for "<strong>{searchTerm}</strong>".
              Try different keywords or check the spelling.
            </p>
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
              your knowledge with the world. Start by creating your first course
              and inspire your students.
            </p>
            <Link
              to="/my-studio/courses/new"
              className="btn-primary-main pink-btn"
            >
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
