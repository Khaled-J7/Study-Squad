// frontend/src/components/Navbar.jsx
import { useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  HiHome,
  HiSearch,
  HiViewGrid,
  HiAcademicCap,
  HiOutlineVideoCamera,
  HiUser,
  HiInformationCircle,
  HiChat,
  HiColorSwatch,
  HiTranslate,
  HiChevronRight,
  HiLogout,
  HiTrash,
  HiOutlineDotsVertical,
  HiChatAlt2,
} from "react-icons/hi";
import { useScroll } from "../hooks/useScroll";
import { useClickOutside } from "../hooks/useClickOutside";
import { useAuth } from "../context/AuthContext";
import SquadHubLogo from "../assets/SquadHUB_logo.png";
import "./Navbar.css";

/**
 * Navbar Component
 * Main navigation bar. Adjusts based on auth state (guest / learner / teacher).
 */
const Navbar = () => {
  // --- STATE & GLOBAL CONTEXT ---
  const { user, logout } = useAuth();
  const scrolled = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // --- DERIVED STATE ---
  const isLoggedIn = !!user;
  const isTeacher = !!user?.studio;

  // --- REFS & HANDLERS ---
  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
    setIsLanguageMenuOpen(false);
  });

  // --- NEW: Robust Avatar URL Logic ---

  const API_BASE_URL = "http://127.0.0.1:8000";
  // Define the path to our local default image as a safety net.
  const localDefaultAvatar = "/default.jpg";
  // Determines the correct avatar URL to display.
  const navAvatarUrl = user?.profile?.profile_picture
    ? `${API_BASE_URL}${user.profile.profile_picture}` // If the backend provides a URL, we use it.
    : localDefaultAvatar; // Otherwise, we use our local fallback image.

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setIsLanguageMenuOpen(false);
  };

  const handleLogout = () => {
    closeAllMenus();
    logout();
  };

  // Toggle used for mobile where there is no hover
  const toggleLanguageMenu = (e) => {
    // Prevent the parent .dropdown-item hover from fighting the click
    e.stopPropagation();
    e.preventDefault();
    setIsLanguageMenuOpen((prev) => !prev);
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* === BRAND LOGO === */}
        <NavLink className="navbar-brand" to="/" onClick={closeAllMenus}>
          <img src="/StudySquadMainLogo.png" alt="Study Squad Logo" />
          <span className="brand-text">Study Squad</span>
        </NavLink>

        {/* === MAIN NAVIGATION LINKS (Desktop & Mobile) === */}
        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <NavLink className="nav-link" to="/" onClick={closeAllMenus}>
            <HiHome className="nav-icon" /> Home
          </NavLink>
          <NavLink className="nav-link" to="/explore" onClick={closeAllMenus}>
            <HiSearch className="nav-icon" /> Explore
          </NavLink>
          <NavLink className="nav-link" to="/squadhub" onClick={closeAllMenus}>
            <img src={SquadHubLogo} alt="SquadHUB" className="nav-icon-img" />{" "}
            SquadHUB
          </NavLink>
          {isTeacher && (
            <NavLink
              className="nav-link"
              to="/my-studio"
              onClick={closeAllMenus}
            >
              <HiViewGrid className="nav-icon" /> My Studio
            </NavLink>
          )}
        </div>

        {/* === USER ACTIONS (Right Side) === */}
        <div className="nav-actions">
          {!isLoggedIn ? (
            // --- GUEST VIEW ---
            <div className="guest-actions">
              <NavLink className="nav-link" to="/about" onClick={closeAllMenus}>
                <HiInformationCircle className="nav-icon" /> About
              </NavLink>
              <Link
                to="/login"
                className="btn btn-login"
                onClick={closeAllMenus}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-signup"
                onClick={closeAllMenus}
              >
                Sign Up
              </Link>
            </div>
          ) : (
            // --- LOGGED-IN VIEW ---
            <div className="logged-in-actions">
              {!isTeacher && (
                <Link
                  to="/become-teacher"
                  className="btn btn-cta-teal"
                  onClick={closeAllMenus}
                >
                  <HiAcademicCap className="nav-icon" /> Become a Teacher
                </Link>
              )}
              <Link
                to="/meet"
                className="btn btn-cta-green"
                onClick={closeAllMenus}
              >
                <HiOutlineVideoCamera className="nav-icon" /> Meet Now
              </Link>

              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="dropdown-toggle-avatar"
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <img
                    src={navAvatarUrl}
                    alt="User Avatar"
                    className="navbar-avatar"
                  />
                </button>

                <div
                  className={`dropdown-menu ${isDropdownOpen ? "active" : ""}`}
                >
                  <NavLink
                    className="dropdown-item"
                    to="/profile"
                    onClick={closeAllMenus}
                  >
                    <img
                      src={navAvatarUrl}
                      alt="User Avatar"
                      className="dropdown-avatar"
                    />
                    <span>My Profile</span>
                  </NavLink>

                  <NavLink
                    className="dropdown-item"
                    to="/about"
                    onClick={closeAllMenus}
                  >
                    <HiInformationCircle className="dropdown-icon" /> About
                  </NavLink>

                  <NavLink
                    className="dropdown-item"
                    to="/contact"
                    onClick={closeAllMenus}
                  >
                    <HiChat className="dropdown-icon" /> Contact Team
                  </NavLink>

                  <button
                    className="dropdown-item"
                    onClick={() =>
                      alert("Theme customization will be available soon!")
                    }
                    type="button"
                  >
                    <HiColorSwatch className="dropdown-icon" /> Theme
                    Preferences
                  </button>

                  {/* LANGUAGE SUBMENU */}
                  <div
                    className={`dropdown-item dropdown-submenu ${
                      isLanguageMenuOpen ? "open" : ""
                    }`}
                    onMouseEnter={() => setIsLanguageMenuOpen(true)}
                    onMouseLeave={() => setIsLanguageMenuOpen(false)}
                  >
                    <button
                      className="submenu-trigger"
                      onClick={toggleLanguageMenu}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isLanguageMenuOpen}
                    >
                      <span className="submenu-trigger-left">
                        <HiTranslate className="dropdown-icon" />
                        <span>Language</span>
                      </span>
                      <HiChevronRight
                        className={`submenu-arrow ${
                          isLanguageMenuOpen ? "rotated" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`submenu ${isLanguageMenuOpen ? "open" : ""}`}
                    >
                      <button
                        className="submenu-item"
                        type="button"
                        onClick={() =>
                          alert("Multi-language support coming soon!")
                        }
                      >
                        <span className="flag-icon">🇺🇸</span>
                        English
                      </button>
                      <button
                        className="submenu-item"
                        type="button"
                        onClick={() =>
                          alert("Multi-language support coming soon!")
                        }
                      >
                        <span className="flag-icon">🇫🇷</span>
                        Français
                      </button>
                      <button
                        className="submenu-item"
                        type="button"
                        onClick={() =>
                          alert("Multi-language support coming soon!")
                        }
                      >
                        <span className="flag-icon">🇹🇳</span>
                        العربية
                      </button>
                    </div>
                  </div>

                  <hr className="dropdown-divider" />

                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                    type="button"
                  >
                    <HiLogout className="dropdown-icon" /> Logout
                  </button>

                  <button
                    className="dropdown-item dropdown-item-danger"
                    type="button"
                  >
                    <HiTrash className="dropdown-icon dropdown-icon-danger" />{" "}
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === HAMBURGER MENU (Mobile) === */}
        <button
          className="hamburger-menu"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
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
