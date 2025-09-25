// frontend/src/pages/dashboard/DashboardHome.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import studioService from "../../api/studioService";
import Spinner from "../../components/common/Spinner";
import DashboardMain from "../../components/dashboard/DashboardMain";

const DashboardHome = () => {
  const { refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDataRefresh = async () => {
    setLoading(true);
    const response = await studioService.getDashboardData();
    if (response.success) {
      setDashboardData(response.data);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    document.body.classList.add("dashboard-active");
    handleDataRefresh();

    return () => {
      document.body.classList.remove("dashboard-active");
    };
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div>No dashboard data available.</div>;
  }

  return (
    <DashboardMain
      dashboardData={dashboardData}
      onDataRefresh={handleDataRefresh}
    />
  );
};

export default DashboardHome;
