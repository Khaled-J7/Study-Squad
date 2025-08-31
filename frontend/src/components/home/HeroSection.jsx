// frontend/src/components/home/HeroSection.jsx
import { Link } from "react-router-dom";
import { HiOutlineArrowRight, HiViewGrid } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext"; // We need our auth hook to know who the user is.
import "./HeroSection.css";

const HeroSection = () => {
  // We get the user object and our isTeacher function from the AuthContext.
  const { user, isTeacher } = useAuth();

  return (
    <section className="hero-section">
      <div className="hero-background"></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <img
          src="/StudySquadMainLogo.png"
          alt="Study Squad Logo"
          className="hero-logo"
        />

        {/* --- DYNAMIC GREETING --- */}
        {user ? (
          <>
            {/* NOTE: Here is the update! We now check for a first_name.
              If it exists, we display their full name. If not, we fall back to the username.
            */}
            <h1 className="hero-headline">
              Welcome back, {user.first_name || user.username}!
            </h1>
            <h2 className="hero-subheadline">Ready for your next lesson?</h2>
          </>
        ) : (
          <>
            {/* If they're a guest, they see our main slogan. */}
            <h1 className="hero-headline">Learn. Teach. Connect.</h1>
            <h2 className="hero-subheadline">All in one place.</h2>
          </>
        )}

        <p className="hero-description">
          Study Squad connects students and teachers through interactive
          lessons, live discussions, and collaborative learning.
        </p>

        {/* --- DYNAMIC ACTIONS --- */}
        <div className="hero-actions">
          <Link to="/explore" className="btn-hero btn-hero-primary">
            <HiOutlineArrowRight /> Explore Courses
          </Link>

          {!user ? (
            // 1. If the user is a GUEST, we invite them to sign up.
            <Link to="/signup" className="btn-hero btn-hero-secondary">
              <HiViewGrid /> Create Your Studio
            </Link>
          ) : isTeacher() ? (
            // 2. If the user IS a TEACHER, we link them to their studio management page.
            <Link to="/my-studio" className="btn-hero btn-hero-secondary">
              <HiViewGrid /> Manage Your Studio
            </Link>
          ) : (
            // 3. If the user is a logged-in LEARNER, we guide them to the hub.
            <Link to="/squadhub" className="btn-hero btn-hero-secondary">
              <HiViewGrid /> Visit the SquadHUB
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
