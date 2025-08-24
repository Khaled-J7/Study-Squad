// frontend/src/components/common/NoResults.jsx
import { HiOutlineEmojiSad } from "react-icons/hi";
import "./NoResults.css";

const NoResults = () => {
  return (
    <div className="no-results-container">
      <div className="no-results-icon-wrapper">
        <HiOutlineEmojiSad className="no-results-icon-main" />
      </div>
      <h3 className="no-results-title">No Results Found</h3>
      <p className="no-results-text">
        Try adjusting your search or filters to find what you're looking for.
      </p>
    </div>
  );
};

export default NoResults;
