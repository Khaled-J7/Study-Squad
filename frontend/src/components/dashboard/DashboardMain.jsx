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
  BarChart3,
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

  const handleCoverUpdateClick = (e) => {
    e.stopPropagation();
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

  return (
    <>
      <main className="dashboard-main">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>{dashboardData.name}</h1>
              <p className="welcome-message">
                Welcome back! Here's a snapshot of your studio's performance.
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

        {/* Studio Info Section - Full width cover image with description below */}
        <div className="studio-info-section">
          <div
            className="cover-image-full interactive"
            style={{ backgroundImage: `url(${coverImageUrl})` }}
            onClick={() => setIsCoverModalOpen(true)}
            title="Click to preview"
          >
            <div className="cover-overlay">
              <button
                className="update-cover-btn"
                onClick={handleCoverUpdateClick}
                title="Update cover image"
              >
                <Camera size={18} />
                <span>Update Cover</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/png, image/jpeg"
            />
          </div>

          <div className="studio-description-full">
            <p className="studio-description-text">
              {dashboardData.description ||
                "Your studio description will appear here. Add a description to tell students what makes your studio unique."}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="section-header">
            <div className="header-title">
              <BarChart3 size={24} />
              <h2>Studio Overview</h2>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon subscribers">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-title">Total Subscribers</h3>
                  <p className="stat-value">
                    {dashboardData.subscribers_count}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon rating">
                  <Star size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-title">Average Rating</h3>
                  <p className="stat-value">
                    {dashboardData.average_rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon courses">
                  <BookCopy size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-title">Total Courses</h3>
                  <p className="stat-value">{dashboardData.lessons_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Courses Section - Clean Grid Layout */}
        <div className="recent-courses-section">
          <div className="section-header">
            <div className="header-title">
              <BookCopy size={24} />
              <h2>Recent Courses</h2>
            </div>
            <Link to="/my-studio/courses" className="btn-secondary">
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {dashboardData.lessons && dashboardData.lessons.length > 0 ? (
            <div className="courses-grid-equal">
              {dashboardData.lessons.map((lesson) => (
                <CourseManagementCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          ) : (
            <div className="no-courses-card">
              <BookCopy size={48} className="no-courses-icon" />
              <h3>No Courses Yet</h3>
              <p>
                You haven't created any courses yet. Click "Create New Course"
                to get started!
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
      </main>

      {/* Image Preview Modal */}
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
