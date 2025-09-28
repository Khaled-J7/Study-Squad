// frontend/src/components/studio/StudioRatingBar.jsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import studioService from "../../api/studioService";
import "./StudioRatingBar.css";

// We'll accept a new prop 'onRatingSuccess' to refresh the page data
const StudioRatingBar = ({ studioId, onRatingSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setMessage("Please select a star rating first.");
      return;
    }

    setIsSubmitting(true);
    setMessage(""); // Clear previous messages
    const response = await studioService.rateStudio(studioId, rating);

    if (response.success) {
      setMessage(response.data.detail); // Show success message from backend
      if (onRatingSuccess) {
        onRatingSuccess(); // Call the parent function to refresh data
      }
    } else {
      setMessage(response.error); // Show error message
    }
    setIsSubmitting(false);
  };

  return (
    <div className="rating-bar-container">
      <div className="rating-bar-prompt">
        <h4>Rate This Studio</h4>
        <p>Share your experience and help others make a choice.</p>
      </div>
      <div className="rating-stars-wrapper">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <label key={ratingValue}>
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
              />
              <Star
                className="star-icon"
                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                fill={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>
      <div className="rating-submit-section">
        <button
          className="btn btn-primary"
          onClick={handleSubmitRating}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Rating"}
        </button>
        {message && <p className="rating-message">{message}</p>}
      </div>
    </div>
  );
};

export default StudioRatingBar;
