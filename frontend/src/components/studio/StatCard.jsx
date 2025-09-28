// frontend/src/components/studio/StatCard.jsx

import React from "react";
import "./StatCard.css";

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
};

export default StatCard;
