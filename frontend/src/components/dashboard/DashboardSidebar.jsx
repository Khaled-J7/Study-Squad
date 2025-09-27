// frontend/src/components/dashboard/DashboardSidebar.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAvatarUrl } from "../../utils/helpers";
import {
  LayoutDashboard,
  BookCopy,
  Users,
  Settings,
  PlusCircle,
  Trash2,
  Edit,
  ChevronDown,
} from "lucide-react";
import "./DashboardSidebar.css";

const DashboardSidebar = () => {
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const navContentRef = useRef(null);
  const location = useLocation();
  const avatarUrl = getAvatarUrl(user);

  const toggleSettings = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Auto-close settings dropdown when navigating away from settings pages
  useEffect(() => {
    if (
      !location.pathname.includes("/my-studio/update") &&
      !location.pathname.includes("/my-studio/delete")
    ) {
      setIsSettingsOpen(false);
    }
  }, [location.pathname]);

  // Handle scroll effect for sidebar
  useEffect(() => {
    const navContent = navContentRef.current;
    if (!navContent) return;

    const handleScroll = () => {
      setIsScrolled(navContent.scrollTop > 0);
    };

    navContent.addEventListener("scroll", handleScroll);
    return () => navContent.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if current location is a settings page
  const isSettingsActive =
    location.pathname.includes("/my-studio/update") ||
    location.pathname.includes("/my-studio/delete");

  return (
    <aside className="dashboard-sidebar" ref={sidebarRef}>
      <div className="sidebar-content">
        <nav className="sidebar-nav" ref={navContentRef}>
          <div
            className={`nav-scroll-container ${isScrolled ? "scrolled" : ""}`}
          >
            <div className="nav-scroll-content">
              {/* Profile section now inside the scrollable area */}
              <div className="sidebar-profile">
                <img
                  src={avatarUrl}
                  alt="Teacher Avatar"
                  className="sidebar-avatar"
                />
                <h2 className="sidebar-username">{`${user.first_name} ${user.last_name}`}</h2>
                <p className="sidebar-headline">{user.profile.headline}</p>
              </div>

              <Link
                to="/my-studio/courses/new"
                className="sidebar-link create-course-btn"
              >
                <PlusCircle size={20} />
                <span>Create New Course</span>
              </Link>

              <p className="nav-menu-title">MENU</p>
              <NavLink to="/my-studio" className="sidebar-link" end>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/my-studio/courses" className="sidebar-link">
                <BookCopy size={20} />
                <span>My Courses</span>
              </NavLink>
              <NavLink to="/my-studio/subscribers" className="sidebar-link">
                <Users size={20} />
                <span>Subscribers</span>
              </NavLink>

              <div className="settings-dropdown">
                <button
                  type="button"
                  className={`sidebar-link settings-toggle ${
                    isSettingsActive ? "active" : ""
                  }`}
                  onClick={toggleSettings}
                >
                  <Settings size={20} />
                  <span className="settings-text">Settings</span>
                  <ChevronDown
                    size={16}
                    className={`chevron-icon ${isSettingsOpen ? "open" : ""}`}
                  />
                </button>
                <div
                  className={`settings-submenu ${isSettingsOpen ? "open" : ""}`}
                >
                  <Link
                    to="/my-studio/update"
                    className={`submenu-link ${
                      location.pathname.includes("/my-studio/update")
                        ? "active"
                        : ""
                    }`}
                  >
                    <Edit size={16} />
                    <span>Update Studio</span>
                  </Link>
                  <Link
                    to="/my-studio/delete"
                    className={`submenu-link delete ${
                      location.pathname.includes("/my-studio/delete")
                        ? "active"
                        : ""
                    }`}
                  >
                    <Trash2 size={16} />
                    <span>Delete Studio</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-logo-link">
          <img src="/StudySquadMainLogo.png" alt="Study Squad Logo" />
          <span>Study Squad</span>
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
