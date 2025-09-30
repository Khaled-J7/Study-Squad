// frontend/src/App.jsx
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useInvitations } from "./hooks/useInvitations";
import meetingService from "./api/meetingService";
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
import PublicStudioPage from "./pages/PublicStudioPage";
import CreatePostPage from "./pages/CreatePostPage";
import PostDetailPage from "./pages/PostDetailPage";
import MyPostsPage from "./pages/MyPostsPage";
import InvitationToast from "./components/common/InvitationToast";
import NotificationsPage from "./pages/NotificationsPage";
import MeetingPage from "./pages/MeetingPage";
import CreateMeetingPage from './pages/CreateMeetingPage';
import "./App.css";

const App = () => {
  // Get the current location
  const location = useLocation();

  const navigate = useNavigate();

  // Check if it's a dashboard route
  const isDashboardRoute = location.pathname.startsWith("/my-studio");

  const { invitations, updateInvitations } = useAuth(); // Get invitations from context
  useInvitations(); // Activate our polling hook globally!

  const handleAccept = async (invitationId, roomName) => {
    await meetingService.updateInvitationStatus(invitationId, "accepted");
    updateInvitations(invitations.filter((inv) => inv.id !== invitationId));
    // Now this will work correctly
    navigate(`/meeting/${roomName}`);
  };

  const handleDecline = async (invitationId) => {
    await meetingService.updateInvitationStatus(invitationId, "declined");
    // Remove the invitation from the list
    updateInvitations(invitations.filter((inv) => inv.id !== invitationId));
  };

  return (
    <>
      <Navbar />
      {/* Display a toast for each pending invitation */}
      <div className="toast-container">
        {invitations.map((inv) => (
          <InvitationToast
            key={inv.id}
            invitation={inv}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))}
      </div>
      <div className="app-content-wrapper">
        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            {/* SQUADHUB ROUTES */}
            <Route path="/squadhub" element={<SquadHubPage />} />
            <Route path="/squadhub/create-post" element={<CreatePostPage />} />
            <Route
              path="/squadhub/posts/:postId"
              element={<PostDetailPage />}
            />
            <Route path="/squadhub/my-posts" element={<MyPostsPage />} />
            {/* END SQUADHUB ROUTES */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />{" "}
            <Route path="/meeting/:roomName" element={<MeetingPage />} />
            <Route path="/create-meeting" element={<CreateMeetingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* This is the new public route for viewing a studio. */}
            <Route path="/studios/:studioId" element={<PublicStudioPage />} />
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
