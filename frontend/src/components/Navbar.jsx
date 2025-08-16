import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  HiHome,
  HiSearch,
  HiChatAlt2,
  HiViewGrid,
  HiInformationCircle,
  HiUser,
  HiLogout,
  HiTrash,
  HiCog,
  HiAcademicCap,
} from "react-icons/hi";
import { MdLiveTv } from "react-icons/md";
import { useScroll } from "../hooks/useScroll";
import { useClickOutside } from "../hooks/useClickOutside";
import "./Navbar.css";

const Navbar = () => {
  // --- STATE MANAGEMENT ---
  const scrolled = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- MOCK USER STATE (to be replaced with real auth context) ---
  const userState = "learner";
  const isLoggedIn = userState === "learner" || userState === "teacher";

  // --- HOOKS ---
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  // --- HANDLERS ---
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleDropdownLinkClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Brand Logo and Name */}
        <NavLink className="navbar-brand" to="/" onClick={handleLinkClick}>
          <img src="/StudySquadMainLogo.png" alt="Study Squad Logo" />
          <span className="brand-text">Study Squad</span>
        </NavLink>

        {/* Main Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <NavLink className="nav-link" to="/" onClick={handleLinkClick}>
            <HiHome className="nav-icon" /> Home
          </NavLink>
          <NavLink className="nav-link" to="/explore" onClick={handleLinkClick}>
            <HiSearch className="nav-icon" /> Explore
          </NavLink>
          <NavLink
            className="nav-link"
            to="/squadhub"
            onClick={handleLinkClick}
          >
            <HiChatAlt2 className="nav-icon" /> SquadHUB
          </NavLink>
          {userState === "teacher" && (
            <NavLink
              className="nav-link"
              to="/my-studio"
              onClick={handleLinkClick}
            >
              <HiViewGrid className="nav-icon" /> My Studio
            </NavLink>
          )}
          {userState === "guest" && (
            <NavLink className="nav-link" to="/about" onClick={handleLinkClick}>
              <HiInformationCircle className="nav-icon" /> About
            </NavLink>
          )}
        </div>

        {/* User Actions Section */}
        <div className="nav-actions">
          {!isLoggedIn ? (
            // Guest Actions
            <>
              <Link to="/login" className="btn btn-login">
                Login
              </Link>
              <Link to="/signup" className="btn btn-signup">
                Sign Up
              </Link>
            </>
          ) : (
            // Logged-in User Actions
            <>
              {userState === "learner" && (
                <Link to="/become-teacher" className="btn btn-cta-teal">
                  <HiAcademicCap className="nav-icon" /> Become a Teacher
                </Link>
              )}
              <Link to="/meet" className="btn btn-cta-green">
                <MdLiveTv className="nav-icon" /> Meet Now
              </Link>
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="dropdown-toggle"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <HiCog size={24} />
                </button>
                <div
                  className={`dropdown-menu ${isDropdownOpen ? "active" : ""}`}
                >
                  <NavLink
                    className="dropdown-item"
                    to="/profile"
                    onClick={handleDropdownLinkClick}
                  >
                    <HiUser className="nav-icon" /> My Profile
                  </NavLink>
                  <NavLink
                    className="dropdown-item"
                    to="/about"
                    onClick={handleDropdownLinkClick}
                  >
                    <HiInformationCircle className="nav-icon" /> About
                  </NavLink>
                  <hr className="dropdown-divider" />
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={handleDropdownLinkClick}
                  >
                    <HiLogout className="nav-icon" /> Logout
                  </a>
                  <a
                    className="dropdown-item text-danger"
                    href="#"
                    onClick={handleDropdownLinkClick}
                  >
                    <HiTrash className="nav-icon" /> Delete Account
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hamburger Menu for Mobile */}
        <button
          className="hamburger-menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
