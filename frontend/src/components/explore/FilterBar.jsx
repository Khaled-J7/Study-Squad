// frontend/src/components/explore/FilterBar.jsx
import { HiSearch, HiUserGroup, HiViewGrid, HiOutlineBookOpen, HiUsers } from "react-icons/hi";
import { useState } from "react";
import "./FilterBar.css";

const FilterBar = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filters = [
    { id: "all", label: "All", icon: HiUserGroup, color: "all" },
    { id: "studios", label: "Studios", icon: HiViewGrid, color: "studio" },
    { id: "courses", label: "Courses", icon: HiOutlineBookOpen, color: "course" },
    { id: "teachers", label: "Teachers", icon: HiUsers, color: "teacher" },
  ];

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    // We will add API call logic here later
  };

  const clearSearch = () => {
    setSearchValue("");
    // We will add API call logic here later
  };

  return (
    <div className="filter-bar-container">
      <div className="search-section">
        <div className={`search-input-wrapper ${searchFocused ? "focused" : ""} ${searchValue ? "has-value" : ""}`}>
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for studios, courses, or teachers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="search-input"
          />
          {searchValue && (
            <button className="clear-search-btn" onClick={clearSearch} type="button">×</button>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                className={`filter-btn ${filter.color} ${activeFilter === filter.id ? "active" : ""}`}
                onClick={() => handleFilterClick(filter.id)}
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