// frontend/src/components/course/Step1_ChooseType.jsx
import React from "react";
import { FileText, Clapperboard, Film, File, ArrowRight } from "lucide-react";
import "./Step1_ChooseType.css";

// This component receives functions from its parent to update data and move to the next step.
const Step1_ChooseType = ({ onNext, updateCourseData }) => {
  // This function handles the user's choice.
  // It updates the parent's state with the chosen type and then moves to the next step.
  const handleSelectType = (type) => {
    updateCourseData({ lesson_type: type });
    onNext();
  };

  return (
    <div className="step-choose-type">
      <div className="step-header">
        <h1>Create a New Course</h1>
        <p>
          How would you like to share your knowledge? Choose a format to get
          started.
        </p>
      </div>

      <div className="type-selection-grid">
        <button
          className="type-card"
          onClick={() => handleSelectType("markdown")}
        >
          <FileText size={40} />
          <h2>Markdown Article</h2>
          <p>Create a text-based lesson with rich formatting.</p>
        </button>

        <button className="type-card" onClick={() => handleSelectType("file")}>
          <File size={40} />
          <h2>Downloadable File</h2>
          <p>Upload a PDF, document, or other file for your students.</p>
        </button>

        <button className="type-card" onClick={() => handleSelectType("video")}>
          <Clapperboard size={40} />
          <h2>Video</h2>
          <p>Upload one video as the entire lesson.</p>
        </button>
      </div>
    </div>
  );
};

export default Step1_ChooseType;
