// frontend/src/components/explore/FilterBar.jsx
import {
  HiSearch,
  HiUserGroup,
  HiViewGrid,
  HiOutlineBookOpen,
  HiUsers,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import "./FilterBar.css";

// The component now accepts onFilterChange as a prop
const FilterBar = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  // This `useEffect` tells the parent page whenever a filter changes
  useEffect(() => {
    onFilterChange(searchValue, activeFilter);
  }, [searchValue, activeFilter, onFilterChange]);

  const filters = [
    { id: "all", label: "All", icon: HiUserGroup, color: "all" },
    { id: "studios", label: "Studios", icon: HiViewGrid, color: "studio" },
    {
      id: "courses",
      label: "Courses",
      icon: HiOutlineBookOpen,
      color: "course",
    },
    { id: "teachers", label: "Teachers", icon: HiUsers, color: "teacher" },
  ];

  return (
    <div className="filter-bar-container">
      {/* Search Input */}
      <div className="search-section">
        <div
          className={`search-input-wrapper ${searchValue ? "has-value" : ""}`}
        >
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for studios, courses, or teachers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input"
          />
          {searchValue && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchValue("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        <div className="filter-buttons">
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                className={`filter-btn ${filter.color} ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <IconComponent className="filter-icon" />
                <span className="filter-label">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
