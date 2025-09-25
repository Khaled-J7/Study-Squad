// frontend/src/components/dashboard/DashboardSidebar.jsx
import React, { useState } from "react"; // ✅ Correct import
import { NavLink, Link } from "react-router-dom";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ✅ Correct usage
  const avatarUrl = getAvatarUrl(user);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  return (
    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-profile">
          <img
            src={avatarUrl}
            alt="Teacher Avatar"
            className="sidebar-avatar"
          />
          <h2 className="sidebar-username">{`${user.first_name} ${user.last_name}`}</h2>
          <p className="sidebar-headline">{user.profile.headline}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/my-studio/courses/new"
            className="sidebar-link create-course-btn"
          >
            <PlusCircle size={20} />
            <span>Create New Course</span>
          </NavLink>

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
            <div
              className={`sidebar-link ${isSettingsOpen ? "active" : ""}`}
              onClick={toggleSettings}
            >
              <Settings size={20} />
              <span className="settings-text">Settings</span>
              <ChevronDown
                size={16}
                className={`chevron-icon ${isSettingsOpen ? "open" : ""}`}
              />
            </div>
            {isSettingsOpen && (
              <div className="settings-submenu">
                <Link to="/my-studio/update" className="submenu-link">
                  <Edit size={16} />
                  <span>Update Studio</span>
                </Link>
                <Link to="/my-studio/delete" className="submenu-link delete">
                  <Trash2 size={16} />
                  <span>Delete Studio</span>
                </Link>
              </div>
            )}
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
