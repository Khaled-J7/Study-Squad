// frontend/src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SquadHubPage from "./pages/SquadHubPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import MyStudioPage from "./pages/MyStudioPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import UpdateStudioPage from "./pages/dashboard/UpdateStudioPage";
import DeleteStudioPage from "./pages/dashboard/DeleteStudioPage";
import MyCoursesPage from "./pages/dashboard/MyCoursesPage";
import SubscribersPage from "./pages/dashboard/SubscribersPage";
import CreateCoursePage from "./pages/dashboard/CreateCoursePage";
import EditCoursePage from "./pages/dashboard/EditCoursePage";
import TeacherOnlyRouteGuard from "./components/common/TeacherOnlyRouteGuard";
import StudioOnboardingPage from "./pages/StudioOnboardingPage";
import CreateStudioPage from "./pages/CreateStudioPage";
import TeacherRouteGuard from "./components/common/TeacherRouteGuard";
import "./App.css";

const App = () => {
  const location = useLocation(); // Get the current location
  const isDashboardRoute = location.pathname.startsWith("/my-studio"); // 3. Check if it's a dashboard route
  return (
    <>
      <Navbar />
      <div className="app-content-wrapper">
        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/squadhub" element={<SquadHubPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* --- Routes Guarded from Teachers --- */}
            <Route element={<TeacherRouteGuard />}>
              <Route
                path="/studio/onboarding"
                element={<StudioOnboardingPage />}
              />
              <Route path="/studio/create" element={<CreateStudioPage />} />
            </Route>

            {/* NESTED DASHBOARD ROUTES */}
            {/* 1. The guard now wraps the parent Route, protecting all children */}
            <Route element={<TeacherOnlyRouteGuard />}>
              {/* 2. The /my-studio path renders the layout component */}
              <Route path="/my-studio" element={<MyStudioPage />}>
                {/* 3. The children render inside the layout's <Outlet> */}
                <Route index element={<DashboardHome />} />
                <Route path="update" element={<UpdateStudioPage />} />
                {/* The route for the delete page */}
                <Route path="delete" element={<DeleteStudioPage />} />
                {/* The route for the "My Courses" page */}
                <Route path="courses" element={<MyCoursesPage />} />
                {/* The route for the "Subscribers" page */}
                <Route path="subscribers" element={<SubscribersPage />} />
                {/* The route for the "Create Course" page */}
                <Route path="courses/new" element={<CreateCoursePage />} />
                {/* A dynamic route that captures the course ID */}
                <Route
                  path="courses/:lessonId/edit"
                  element={<EditCoursePage />}
                />
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
      {/* 4. Conditionally render the Footer */}
      {!isDashboardRoute && <Footer />}
    </>
  );
};

export default App;
