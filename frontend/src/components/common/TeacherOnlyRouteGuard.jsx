// frontend/src/components/common/TeacherOnlyRouteGuard.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "./Spinner";

const TeacherOnlyRouteGuard = () => {
  const { user, isTeacher, loading } = useAuth();

  if (loading) {
    // If we are still checking the user's auth status, show a spinner
    return (
      <div className="page-spinner-container">
        <Spinner />
      </div>
    );
  }

  if (user && isTeacher()) {
    // If the user is logged in and is a teacher, render the child route (our dashboard page)
    return <Outlet />;
  } else {
    // If not a teacher, or not logged in, redirect to the home page
    return <Navigate to="/" replace />;
  }
};

export default TeacherOnlyRouteGuard;
