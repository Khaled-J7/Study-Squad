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

// // frontend/src/pages/MyStudioPage.jsx
// import React, { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import studioService from "../api/studioService";
// import Spinner from "../components/common/Spinner";
// import DashboardSidebar from "../components/dashboard/DashboardSidebar";
// import DashboardMain from "../components/dashboard/DashboardMain";
// import "./MyStudioPage.css";

// const MyStudioPage = () => {
//   const { refreshUser } = useAuth();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Add state for sidebar

//   const handleDataRefresh = async () => {
//     setLoading(true);
//     const response = await studioService.getDashboardData();
//     if (response.success) {
//       setDashboardData(response.data);
//     } else {
//       setError(response.error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     document.body.classList.add("dashboard-active");
//     const fetchDashboardData = async () => {
//       const response = await studioService.getDashboardData();
//       if (response.success) {
//         setDashboardData(response.data);
//       } else {
//         setError(response.error);
//       }
//       setLoading(false);
//     };

//     fetchDashboardData();
//     handleDataRefresh(); // Call it on initial load

//     return () => {
//       document.body.classList.remove("dashboard-active");
//     };
//   }, []);

//   const toggleSidebar = () => {
//     setIsSidebarCollapsed(!isSidebarCollapsed);
//   };

//   if (loading) {
//     return (
//       <div className="page-spinner-container">
//         <Spinner />
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="page-container error-message">Error: {error}</div>;
//   }

//   if (!dashboardData) {
//     return <div className="page-container">No dashboard data available.</div>;
//   }

//   return (
//     <div
//       className={`dashboard-layout ${
//         isSidebarCollapsed ? "sidebar-collapsed" : ""
//       }`}
//     >
//       <DashboardSidebar
//         isCollapsed={isSidebarCollapsed}
//         onToggle={toggleSidebar} // 3. Pass state and function to sidebar
//       />
//       <DashboardMain
//         dashboardData={dashboardData}
//         onDataRefresh={handleDataRefresh}
//       />
//     </div>
//   );
// };

// export default MyStudioPage;
