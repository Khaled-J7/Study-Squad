// In frontend/src/components/explore/CourseCard.jsx

import React, { useState } from "react";
import AuthLink from "../common/AuthLink";
import { HiTag, HiArrowRight, HiCalendar, HiViewGrid } from "react-icons/hi";
import { getCourseCoverUrl, getAvatarUrl } from "../../utils/helpers";
import CourseViewerModal from "../dashboard/CourseViewerModal";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  // NEW: State for the course viewer modal
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const courseCoverImage = getCourseCoverUrl(course);
  const teacherAvatarImage = getAvatarUrl(course.studio.owner);

  const creationDate = course.created_at
    ? new Date(course.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const shortDescription =
    course.description?.length > 100
      ? `${course.description.substring(0, 100)}...`
      : course.description;

  return (
    <>
      {/* Course Viewer Modal */}
      {isViewerOpen && (
        <CourseViewerModal
          lessonId={course.id}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      <div className="card-wrapper-course">
        <div className="course-card-image-container">
          <img
            src={courseCoverImage}
            alt={`${course.title} cover`}
            className="course-card-cover-image"
          />
        </div>
        <div className="course-card-info">
          <h3 className="course-card-title">{course.title}</h3>
          <p className="course-card-description">
            {isDescExpanded ? course.description : shortDescription}
            {course.description?.length > 100 && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="course-card-read-more"
              >
                {isDescExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </p>

          <div className="course-card-meta">
            <div className="meta-item">
              <img
                src={teacherAvatarImage}
                alt={course.studio.owner.username}
                className="meta-avatar"
              />
              <div className="meta-text">
                <span className="meta-label">Instructor</span>
                <span className="meta-value">
                  {course.studio.owner.first_name}{" "}
                  {course.studio.owner.last_name}
                </span>
              </div>
            </div>
            <div className="meta-item">
              <HiViewGrid className="meta-icon" />
              <div className="meta-text">
                <span className="meta-label">Studio</span>
                {/* FIX: The link should go to /studios/:id now */}
                <AuthLink
                  to={`/studios/${course.studio.id}`}
                  className="meta-link"
                >
                  {course.studio.name}
                </AuthLink>
              </div>
            </div>
          </div>

          <div className="card-tags">
            {course.tags?.map((tag) => (
              <AuthLink
                to={`/explore?tags=${tag.name}`}
                key={tag.id}
                className="card-tag"
              >
                <HiTag /> {tag.name}
              </AuthLink>
            ))}
          </div>
        </div>
        <div className="card-footer course">
          <div className="card-stats">
            {creationDate && (
              <>
                <HiCalendar />
                <span>{creationDate}</span>
              </>
            )}
          </div>
          <button className="card-button" onClick={() => setIsViewerOpen(true)}>
            <span>Explore Course</span>
            <HiArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};

export default CourseCard;
