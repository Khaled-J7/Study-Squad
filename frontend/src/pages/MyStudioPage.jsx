// frontend/src/pages/MyStudioPage.jsx
import React from "react";
import { Outlet } from "react-router-dom"; // 1. Import Outlet
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import "./MyStudioPage.css";

const MyStudioPage = () => {
  // This component now only serves as the layout
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-content-area">
        <Outlet /> {/* 2. This is where child routes will be rendered */}
      </main>
    </div>
  );
};

export default MyStudioPage;
