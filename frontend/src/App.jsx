// frontend/src/App.jsx

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import SquadHubPage from "./pages/SquadHubPage";
import AboutPage from "./pages/AboutPage";
import MyStudioPage from "./pages/MyStudioPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
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
            <Route path="/my-studio" element={<MyStudioPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default App;
