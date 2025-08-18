// frontend/src/components/HeroSection.jsx
import { Link } from "react-router-dom";
import { HiOutlineArrowRight, HiPlus } from "react-icons/hi";
import './HeroSection.css';

const HeroSection = () => {
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
        <h1 className="hero-headline">Learn. Teach. Connect.</h1>
        <h2 className="hero-subheadline">All in one place.</h2>
        <p className="hero-description">
          Study Squad connects students and teachers through interactive
          lessons, live discussions, and collaborative learning.
        </p>
        <div className="hero-actions">
          <Link to="/explore" className="btn-hero btn-hero-primary">
            <HiOutlineArrowRight /> Explore Courses
          </Link>
          <Link to="/become-teacher" className="btn-hero btn-hero-secondary">
            <HiPlus /> Create Your Studio
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
