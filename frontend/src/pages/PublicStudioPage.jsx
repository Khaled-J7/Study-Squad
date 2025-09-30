// frontend/src/pages/PublicStudioPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import studioService from "../api/studioService";
import Spinner from "../components/common/Spinner";
import CourseManagementCard from "../components/dashboard/CourseManagementCard";
import StudioHeader from "../components/studio/StudioHeader";
import ConfirmationModal from "../components/common/ConfirmationModal";
import StatCard from "../components/studio/StatCard";
import StudioRatingBar from "../components/studio/StudioRatingBar";
import CourseViewerModal from "../components/dashboard/CourseViewerModal";
import CredentialsSection from "../components/studio/CredentialsSection";
import { Star, User, BookOpen } from "lucide-react";
import AuthLink from "../components/common/AuthLink";
import "./PublicStudioPage.css";

const PublicStudioPage = () => {
  const { studioId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [studioData, setStudioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState(null); // State for the selected course id
  const [isCourseViewerOpen, setIsCourseViewerOpen] = useState(false); // State for the viewer modal

  // A variable to check if the current user is the studio owner
  const isOwner = user && user.id === studioData?.owner?.id;

  // This is our function to refresh the data on the page
  const fetchStudioData = async () => {
    // We set loading to true to give feedback, e.g., for a spinner
    setIsLoading(true);
    const response = await studioService.getPublicStudio(studioId);
    if (response.success) {
      setStudioData(response.data);
    } else {
      setError("Could not load the studio. It may not exist.");
    }
    setIsLoading(false);
  };

  // We only want this to run once on the initial load
  useEffect(() => {
    fetchStudioData();
  }, [studioId]);

  const handleSubscribeClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (studioData.is_subscribed) {
      setIsModalOpen(true);
    } else {
      await performSubscription();
    }
  };

  // NEW: Handler to open the course viewer
  const handlePreviewCourse = (course) => {
    setSelectedCourseId(course.id);
    setIsCourseViewerOpen(true);
  };

  const closeCourseViewer = () => {
    setIsCourseViewerOpen(false);
    setSelectedCourseId(null);
  };

  const performSubscription = async () => {
    setIsSubmitting(true);
    const response = await studioService.subscribeToStudio(studioId);
    if (response.success) {
      setStudioData((prevData) => ({
        ...prevData,
        is_subscribed: true,
        subscribers_count: prevData.subscribers_count + 1,
      }));
    }
    setIsSubmitting(false);
  };

  const performUnsubscription = async () => {
    setIsModalOpen(false);
    setIsSubmitting(true);
    const response = await studioService.unsubscribeFromStudio(studioId);
    if (response.success) {
      setStudioData((prevData) => ({
        ...prevData,
        is_subscribed: false,
        subscribers_count: prevData.subscribers_count - 1,
      }));
    }
    setIsSubmitting(false);
  };

  // This handler will navigate to the create page with the studio owner's data.
  const handleScheduleMeeting = () => {
    // We only proceed if we have the studio owner's data
    if (studioData?.owner) {
      navigate('/create-meeting', { state: { initialInvitee: studioData.owner } });
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  if (!studioData) {
    return null;
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={performUnsubscription}
        title="Unsubscribe"
      >
        <p>Are you sure you want to unsubscribe from this studio?</p>
      </ConfirmationModal>

      {/* We only render the modal if an ID is selected, and we pass the 'lessonId' prop correctly.*/}
      {isCourseViewerOpen && selectedCourseId && (
        <CourseViewerModal
          lessonId={selectedCourseId}
          onClose={closeCourseViewer}
        />
      )}

      <div className="public-studio-page">
        <StudioHeader
          studioData={studioData}
          onSubscribeClick={handleSubscribeClick}
          isSubmitting={isSubmitting}
          isOwner={isOwner}
          onScheduleMeeting={handleScheduleMeeting}
        />

        <div className="studio-content-body">
          {studioData.description && (
            <section className="studio-description-section">
              <h2>About this Studio</h2>
              <p>{studioData.description}</p>
            </section>
          )}
          
          {/* NEW: Stats Section */}
          <section className="studio-stats-section">
            <StatCard
              icon={<Star size={24} />}
              label="Rating"
              value={studioData.average_rating.toFixed(1)}
            />
            <StatCard
              icon={<User size={24} />}
              label="Subscribers"
              value={studioData.subscribers_count}
            />
            <StatCard
              icon={<BookOpen size={24} />}
              label="Courses"
              value={studioData.lessons.length}
            />
          </section>

          {/* CredentialsSection: CV + Degrees */}
          <CredentialsSection profile={studioData.owner.profile} />

          {/* The Rating Bar: We pass the fetchStudioData function as the onRatingSuccess prop */}
          <StudioRatingBar
            studioId={studioId}
            onRatingSuccess={fetchStudioData}
          />

          {/* FIX: Check for description before rendering */}

          <section className="studio-courses-section">
            <h2>Courses</h2>
            {studioData.lessons && studioData.lessons.length > 0 ? (
              <div className="courses-grid">
                {studioData.lessons.map((lesson) => (
                  <CourseManagementCard
                    key={lesson.id}
                    lesson={lesson}
                    isPublicView={true}
                    onPreview={() => handlePreviewCourse(lesson)}
                  />
                ))}
              </div>
            ) : (
              <p className="no-results-message">
                This studio hasn't published any courses yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default PublicStudioPage;
