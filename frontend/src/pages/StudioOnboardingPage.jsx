import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiCheckCircle,
  HiArrowRight,
  HiSparkles,
  HiAcademicCap,
  HiUsers,
} from "react-icons/hi";
import WelcomeImage from "../assets/StudioCreationWelcomeImg.jpg";
import "./StudioOnboardingPage.css";

const StudioOnboardingPage = () => {
  const { user } = useAuth();

  return (
    <div className="studio-onboarding">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="welcome-badge">
              <HiSparkles className="badge-icon" />
              <span>Join Our Teaching Community</span>
            </div>
            <h1 className="hero-title">
              Ready to Build Your Studio,{" "}
              <span className="highlight">{user?.first_name}</span>?
            </h1>
            <p className="hero-subtitle">
              Your Studio is your professional space on Study Squad. Build your
              brand, share your expertise, and connect with learners worldwide.
            </p>
          </div>
          <div className="hero-image">
            <div className="image-container">
              <img
                src={WelcomeImage}
                alt="Teacher presenting online"
                className="welcome-image"
              />
              <div className="image-overlay">
                <div className="stat-card">
                  <HiUsers className="stat-icon" />
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="guidelines-section">
        <div className="container">
          <div className="section-header">
            <HiAcademicCap className="section-icon" />
            <h2>What Makes a Great Studio?</h2>
            <p>
              Follow these essential steps to create an outstanding teaching
              presence
            </p>
          </div>

          <div className="guidelines-timeline">
            <div className="timeline-item">
              <div className="timeline-marker">
                <span className="step-number">1</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-icon">
                  <HiSparkles />
                </div>
                <h3>Showcase Your Brand</h3>
                <p>
                  Give your studio a unique name and professional cover image
                  that reflects your teaching style and personality.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <span className="step-number">2</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-icon">
                  <HiAcademicCap />
                </div>
                <h3>Describe Your Vision</h3>
                <p>
                  Write a clear, compelling description of what you teach and
                  what makes your approach special and unique.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <span className="step-number">3</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-icon">
                  <HiCheckCircle />
                </div>
                <h3>Tag Your Expertise</h3>
                <p>
                  Use relevant tags and categories to help students discover
                  your content and courses effortlessly.
                </p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-marker">
                <span className="step-number">4</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-icon">
                  <HiUsers />
                </div>
                <h3>Launch & Connect</h3>
                <p>
                  Publish your studio and start connecting with eager learners
                  ready to discover your expertise.
                </p>
              </div>
            </div>
          </div>

          <div className="pro-tip">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <strong>Pro Tip:</strong> No cover image ready? No worries! We'll
              provide a professional default design to get you started
              immediately.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Teaching Journey?</h2>
            <p>
              Join thousands of educators already sharing their knowledge on
              Study Squad
            </p>
            <Link to="/studio/create" className="cta-button">
              <HiSparkles className="cta-icon" />
              <span>Create Your Studio</span>
              <HiArrowRight className="cta-arrow" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudioOnboardingPage;
