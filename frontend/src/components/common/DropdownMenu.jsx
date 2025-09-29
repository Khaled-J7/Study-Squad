// frontend/src/components/common/DropdownMenu.jsx
import React, { useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import "./DropdownMenu.css";

const DropdownMenu = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={20} />
      </button>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => {
                option.action();
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default DropdownMenu;
