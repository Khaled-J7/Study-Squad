// In frontend/src/components/common/TeacherRouteGuard.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "./Spinner";

/**
 * A route guard that prevents teachers from accessing certain pages
 * (like the studio creation flow).
 * If the user is a teacher, it redirects them to their studio dashboard.
 */
const TeacherRouteGuard = () => {
  const { user, loading } = useAuth();

  // 1. If the auth state is still loading, show a spinner
  //    to prevent a flash of the wrong page.
  if (loading) {
    return <Spinner />;
  }

  // 2. If the user is loaded AND they are a teacher (user.studio exists),
  //    redirect them to their dashboard.
  if (user && user.studio) {
    return <Navigate to="/my-studio" replace />;
  }

  // 3. If the user is not a teacher or is a guest, allow them to see the page.
  //    The <Outlet /> component renders the actual page component (e.g., CreateStudioPage).
  return <Outlet />;
};

export default TeacherRouteGuard;
