// frontend/src/pages/dashboard/CreateCoursePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import studioService from "../../api/studioService"; // We will add the createCourse function to this service
import Step1_ChooseType from "../../components/course/Step1_ChooseType";
import Step2_CoreDetails from "../../components/course/Step2_CoreDetails";
import Step3_AddContent from "../../components/course/Step3_AddContent";
import InlineError from "../../components/common/InlineError/InlineError";
import "./CreateCoursePage.css";

// We define a single, unique key for our comprehensive course draft.
const COURSE_DRAFT_KEY = "studySquadCourseDraft";

const CreateCoursePage = () => {
  const navigate = useNavigate();

  // This is the core of the logic. When the component first loads,
  // it checks Local Storage for a saved draft.
  const [courseData, setCourseData] = useState(() => {
    try {
      const savedDraft = localStorage.getItem(COURSE_DRAFT_KEY);
      // If a draft exists, we parse the JSON string back into an object.
      if (savedDraft) {
        console.log("Found a saved draft, loading it now.");
        return JSON.parse(savedDraft);
      }
    } catch (error) {
      console.error("Failed to parse course draft from Local Storage", error);
    }
    // If no draft exists, or if there was an error, we start with a blank state.
    return {
      lesson_type: "",
      title: "",
      description: "",
      cover_image: null,
      tags: [],
      markdown_content: "",
      lesson_file: null,
      lesson_video: null,
    };
  });

  // State for tracking the current step of the form.
  // We also save the current step, so the user is returned to the correct place.
  const [currentStep, setCurrentStep] = useState(() => {
    const savedDraft = localStorage.getItem(COURSE_DRAFT_KEY);
    if (savedDraft) {
      // If a draft has a title, we assume the user was at least on step 2.
      return JSON.parse(savedDraft).title ? 2 : 1;
    }
    return 1;
  });

  // State for managing the final submission process.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * This useEffect hook is our new autosave engine.
   * It now watches the entire 'courseData' object for any changes.
   */
  useEffect(() => {
    // This timer prevents us from writing to Local Storage on every single keystroke.
    // It's a performance optimization known as "debouncing".
    const timer = setTimeout(() => {
      // We only save if the user has at least chosen a course type.
      if (courseData.lesson_type) {
        // We convert the entire courseData object into a JSON string to store it.
        localStorage.setItem(COURSE_DRAFT_KEY, JSON.stringify(courseData));
      }
    }, 1000); // Wait 1 second after the last change before saving.

    return () => clearTimeout(timer);
  }, [courseData]); // This effect will re-run whenever the 'courseData' object changes.

  // A single function passed down to child components to update the main state.
  const updateCourseData = (data) => {
    setCourseData((prevData) => ({ ...prevData, ...data }));
  };

  // Helper functions to navigate between the form steps.
  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // This is the final submission handler, called from Step 3.
  // It is the main submission handler for non-playlist courses.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // We must use FormData because we are sending files (cover image, video, etc.).
    const formData = new FormData();
    formData.append("lesson_type", courseData.lesson_type);
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    // Append tags to the FormData object.
    courseData.tags.forEach((tag) => formData.append("tag_names", tag));

    // We conditionally append the content fields, only sending the one that's needed.
    if (courseData.cover_image)
      formData.append("cover_image", courseData.cover_image);
    if (courseData.markdown_content)
      formData.append("markdown_content", courseData.markdown_content);
    if (courseData.lesson_file)
      formData.append("lesson_file", courseData.lesson_file);
    if (courseData.lesson_video)
      formData.append("lesson_video", courseData.lesson_video);

    // We call our new API service function to create the course.
    const response = await studioService.createCourse(formData);

    if (response.success) {
      // On a successful submission, we MUST clear the draft from Local Storage.
      localStorage.removeItem(COURSE_DRAFT_KEY);
      // If creation is successful, we redirect the teacher to their list of courses.
      navigate("/my-studio/courses");
    } else {
      // If there's an error from the backend, we display it.
      setError(
        response.error || "An unknown error occurred during course creation."
      );
      setIsSubmitting(false);
    }
  };

  // This function renders the correct component for the current step.
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_ChooseType
            onNext={nextStep}
            updateCourseData={updateCourseData}
          />
        );
      case 2:
        return (
          <Step2_CoreDetails
            onNext={nextStep}
            onBack={prevStep}
            courseData={courseData}
            updateCourseData={updateCourseData}
          />
        );
      case 3:
        return (
          <Step3_AddContent
            onBack={prevStep}
            courseData={courseData}
            updateCourseData={updateCourseData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <Step1_ChooseType
            onNext={nextStep}
            updateCourseData={updateCourseData}
          />
        );
    }
  };

  return (
    <div className="create-course-page">
      <div className="progress-bar">
        <div
          className={`progress-step ${currentStep >= 1 ? "active" : ""} ${
            currentStep > 1 ? "completed" : ""
          }`}
        >
          <span>1</span>Choose Format
        </div>
        <div
          className={`progress-step ${currentStep >= 2 ? "active" : ""} ${
            currentStep > 2 ? "completed" : ""
          }`}
        >
          <span>2</span>Course Details
        </div>
        <div className={`progress-step ${currentStep >= 3 ? "active" : ""}`}>
          <span>3</span>Add Content
        </div>
      </div>
      <div className="create-course-form-container">
        {renderCurrentStep()}
        {/* This will display any submission errors at the bottom of the form. */}
        {error && (
          <div style={{ marginTop: "1.5rem" }}>
            <InlineError message={error} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCoursePage;
