// frontend/src/components/course/Step1_ChooseType.jsx
import React from "react";
import { FileText, Clapperboard, Film, File, ArrowRight } from "lucide-react";
import "./Step1_ChooseType.css";

const Step1_ChooseType = ({ onNext, updateCourseData }) => {
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
          className="type-card type-card-markdown"
          onClick={() => handleSelectType("markdown")}
        >
          <div className="card-icon">
            <FileText size={40} />
          </div>
          <h2>Markdown Article</h2>
          <p>Create a text-based lesson with rich formatting.</p>
          <div className="card-arrow">
            <ArrowRight size={20} />
          </div>
        </button>

        <button
          className="type-card type-card-file"
          onClick={() => handleSelectType("file")}
        >
          <div className="card-icon">
            <File size={40} />
          </div>
          <h2>Downloadable File</h2>
          <p>Upload a PDF, document, or other file for your students.</p>
          <div className="card-arrow">
            <ArrowRight size={20} />
          </div>
        </button>

        <button
          className="type-card type-card-video"
          onClick={() => handleSelectType("video")}
        >
          <div className="card-icon">
            <Clapperboard size={40} />
          </div>
          <h2>Video</h2>
          <p>Upload one video as the entire lesson.</p>
          <div className="card-arrow">
            <ArrowRight size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Step1_ChooseType;
