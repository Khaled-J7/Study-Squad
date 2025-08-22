// frontend/src/components/explore/FilterBar.jsx
import { HiSearch } from "react-icons/hi";
import "./FilterBar.css";

const FilterBar = () => {
  return (
    <div className="filter-bar-container">
      <div className="search-input-wrapper">
        <HiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for studios, courses, or teachers..."
        />
      </div>
      <div className="filter-buttons">
        <button className="filter-btn studio">Studios</button>
        <button className="filter-btn course">Courses</button>
        <button className="filter-btn teacher">Teachers</button>
      </div>
    </div>
  );
};

export default FilterBar;
