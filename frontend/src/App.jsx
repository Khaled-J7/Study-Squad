// frontend/src/App.jsx

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SquadHubPage from "./pages/SquadHubPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
// MyStudioPage will be created soon
// import MyStudioPage from "./pages/MyStudioPage";
import StudioOnboardingPage from "./pages/StudioOnboardingPage";
import CreateStudioPage from "./pages/CreateStudioPage";
import TeacherRouteGuard from "./components/common/TeacherRouteGuard";
import "./App.css";

const App = () => {
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

            {/* --- Routes for Teachers Only (we will build this next) --- */}
            {/* <Route path="/my-studio" element={<MyStudioPage />} /> */}
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default App;
