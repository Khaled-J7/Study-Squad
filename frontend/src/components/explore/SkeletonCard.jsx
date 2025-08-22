// frontend/src/components/explore/SkeletonCard.jsx
import "./SkeletonCard.css";

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line medium"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
