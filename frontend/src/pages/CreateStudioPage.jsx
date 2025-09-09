// frontend/src/pages/CreateStudioPage.jsx
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HiChevronLeft, HiChevronRight, HiCheck } from "react-icons/hi";
import studioService from "../api/studioService";
import Step1_Essentials from "../components/studio/Step1_Essentials";
import Step2_Visuals from "../components/studio/Step2_Visuals";
import Step3_Expertise from "../components/studio/Step3_Expertise";
import Step4_Connection from "../components/studio/Step4_Connection";
import SuccessModal from "../components/common/SuccessModal";
import Spinner from "../components/common/Spinner";
import "./CreateStudioPage.css";

// This array defines the steps for our progress bar and logic.
const steps = ["The Essentials", "Visuals", "Expertise", "Connection"];

const CreateStudioPage = () => {
  // --- STATE MANAGEMENT ---
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // This state tracks which step of the form the user is currently on.
  const [currentStep, setCurrentStep] = useState(1);

  // This state is a boolean to show a loading indicator on the "Finish" button.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This state will control the visibility of our new success modal.
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // This state holds all the data from all form steps combined.
  const [formData, setFormData] = useState({
    name: "",
    job_title: "",
    description: "",
    cover_image: null,
    tags: [],
    degrees: [],
    cv_file: null,
    experience: [],
    social_links: { email: "", linkedin: "", twitter: "" },
  });

  // --- NEW: THE REDIRECT GUARD ---
  /**
   * This useEffect hook runs whenever the 'user' object or 'navigate' function changes.
   * Its job is to protect this page from being accessed by users who are already teachers.
   */
  useEffect(() => {
    // We check if the user object exists and if it has a 'studio' property.
    if (user && user.studio) {
      console.log("User is already a teacher. Redirecting to dashboard...");
      // If they are a teacher, we immediately redirect them to their studio dashboard.
      navigate("/my-studio");
    }
  }, [user, navigate]); // Dependencies: This effect re-runs if the user logs in/out or if the navigate function changes.

  // --- HANDLER FUNCTIONS ---

  // Moves the user to the next step in the form.
  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  // Moves the user to the previous step in the form.
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  // Handles text input changes for Step 1.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // The final submission function, called when the "Finish" button is clicked.
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const response = await studioService.createStudio(formData);

    if (response.success) {
      // After creating the studio, the user is now a teacher.
      // We MUST refresh the user data to update their role across the app.
      await refreshUser();
      // Instead of an alert, we now show our beautiful success modal.
      setShowSuccessModal(true);
    } else {
      console.error("Submission failed:", response.details);
      alert(response.error);
    }

    setIsSubmitting(false);
  };

  // This function determines which form step component to render.
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_Essentials
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 2:
        return <Step2_Visuals formData={formData} setFormData={setFormData} />;
      case 3:
        return (
          <Step3_Expertise formData={formData} setFormData={setFormData} />
        );
      case 4:
        return (
          <Step4_Connection formData={formData} setFormData={setFormData} />
        );
      default:
        return null;
    }
  };

  // --- RENDER LOGIC ---
  // If the user is a teacher, this component will redirect before rendering anything meaningful.
  // We can return null or a loading spinner to prevent a "flash" of the form content.
  if (user && user.studio) {
    return <Spinner />; // Or null
  }

  return (
    // We use a React Fragment <> to return multiple top-level elements.
    <>
      <div className="studio-creation-container">
        {/* --- CHILD 1: THE HEADER (Spans full width) --- */}
        <div className="studio-creation-header">
          <h1>
            Welcome, {user?.first_name}! Let's build your professional Studio.
          </h1>
          <p>
            This is your space to shine. In just a few steps, you'll create a
            professional hub to connect with learners, showcase your expertise,
            and start sharing your knowledge. Let's lay the foundation for your
            teaching journey on Study Squad.
          </p>
        </div>

        {/* --- CHILD 2: THE MAIN TWO-COLUMN CONTENT --- */}
        <div className="studio-creation-main-content">
          {/* Column 1: Progress Bar */}
          <div className="progress-bar-container">
            {steps.map((step, index) => {
              // --- CHANGE START: Add a variable for clarity ---
              const isCompleted = currentStep > index + 1;
              const isActive = currentStep === index + 1;
              // --- CHANGE END ---

              return (
                <div
                  key={index}
                  className={`progress-step ${isActive ? "step-active" : ""} ${
                    isCompleted ? "step-completed" : ""
                  }`}
                >
                  <div className="step-circle">
                    {/* --- CHANGE START: Conditional rendering --- */}
                    {isCompleted ? <HiCheck size={28} /> : index + 1}
                    {/* --- CHANGE END --- */}
                  </div>
                  <div className="step-label">{step}</div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Form Content */}
          <div className="form-step-container">
            {renderStepContent()}
            <div className="step-navigation">
              <button
                onClick={prevStep}
                className="step-btn step-btn-secondary"
                disabled={currentStep === 1}
              >
                <HiChevronLeft />
                Previous Step
              </button>
              {currentStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  className="step-btn step-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating Studio..."
                    : "Finish & Create Studio"}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="step-btn step-btn-primary"
                >
                  Next Step
                  <HiChevronRight />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- SUCCESS MODAL (Correctly placed here) --- */}
      {showSuccessModal && (
        <SuccessModal
          title="Congratulations!"
          message="Your studio is now live. You can now manage your content and engage with students."
          buttonText="Go to My Studio Dashboard"
          buttonLink="/my-studio"
        />
      )}
    </>
  );
};

export default CreateStudioPage;
