// frontend/src/components/dashboard/DashboardMain.jsx
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  ArrowRight,
  Users,
  Star,
  BookCopy,
  Camera,
} from "lucide-react";
import CourseManagementCard from "./CourseManagementCard";
import ImagePreviewModal from "../common/ImagePreviewModal";
import studioService from "../../api/studioService";
import "./DashboardMain.css";

const DashboardMain = ({ dashboardData, onDataRefresh }) => {
  const API_BASE_URL = "http://127.0.0.1:8000";
  const coverImageUrl = `${API_BASE_URL}${dashboardData.cover_image}`;

  // State for modal and ref for file input
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleCoverUpdateClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const response = await studioService.updateCoverImage(file);
      if (response.success) {
        onDataRefresh(); // Refresh the data to show the new image
      } else {
        alert(response.error);
      }
    }
  };

  // ✅ THE NEW, ROBUST FIX
  const handleCoverContainerClick = (e) => {
    // This function checks what was clicked.
    // If the click came from the button (or anything inside it), it does nothing.
    if (e.target.closest(".update-cover-btn")) {
      return;
    }
    // Otherwise, it opens the preview modal.
    setIsCoverModalOpen(true);
  };

  return (
    <>
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>{dashboardData.name}</h1>
            <p>Welcome back! Here's a snapshot of your studio's performance.</p>
          </div>
          <Link to="/my-studio/courses/new" className="btn-primary-main">
            <PlusCircle size={20} />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* New Content Order */}
        <div
          className="cover-image-container interactive"
          style={{ backgroundImage: `url(${coverImageUrl})` }}
          onClick={() => setIsCoverModalOpen(true)}
          title="Click to preview"
        >
          {/* 4. THE DEFINITIVE FIX: Add stopPropagation to all elements inside the button */}
          {/* ✅ THE FIX IS HERE: The button now reliably triggers the click */}
            <button 
                className="update-cover-btn" 
                onClick={handleCoverUpdateClick} // The whole button now calls the handler
                title="Update cover image"
            >
                <Camera size={18} />
                <span>Update Cover</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                style={{ display: 'none' }} 
                accept="image/png, image/jpeg"
            />
        </div>
        

        <p className="studio-description">
          {dashboardData.description ||
            "Your studio description will appear here."}
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon subscribers">
              <Users size={24} />
            </div>
            <div>
              <h3 className="stat-title">Total Subscribers</h3>
              <p className="stat-value">{dashboardData.subscribers_count}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rating">
              <Star size={24} />
            </div>
            <div>
              <h3 className="stat-title">Average Rating</h3>
              <p className="stat-value">
                {dashboardData.average_rating.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon courses">
              <BookCopy size={24} />
            </div>
            <div>
              <h3 className="stat-title">Total Courses</h3>
              <p className="stat-value">{dashboardData.lessons_count}</p>
            </div>
          </div>
        </div>

        <div className="recent-courses-section">
          <div className="section-header">
            <h2>Recent Courses</h2>
            {/* View All is now a button */}
            <Link to="/my-studio/courses" className="btn-secondary">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          {dashboardData.lessons && dashboardData.lessons.length > 0 ? (
            <div className="courses-grid">
              {dashboardData.lessons.map((lesson) => (
                <CourseManagementCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          ) : (
            <p className="no-courses-message">
              You haven't created any courses yet. Click "Create New Course" to
              get started!
            </p>
          )}
        </div>
      </main>
      {/* 6. Conditionally render the modal */}
      {isCoverModalOpen && (
        <ImagePreviewModal
          imageUrl={coverImageUrl}
          onClose={() => setIsCoverModalOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardMain;
