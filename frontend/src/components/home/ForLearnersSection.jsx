// frontend/src/components/home/ForLearnersSection.jsx
import {
  HiOutlineLightBulb,
  HiOutlineBookOpen,
  HiOutlineUsers,
} from "react-icons/hi";
import "./ForLearnersSection.css";

const ForLearnersSection = () => {
  return (
    <section className="learners-section">
      <div className="learners-container">
        <div className="section-header">
          <h2 className="section-title">Built for the Future of Education</h2>
          <p className="section-subtitle">
            Experience learning like never before with our innovative approach
            to education
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon">
              <HiOutlineLightBulb />
            </div>
            <h3 className="feature-card-title">Real Connections</h3>
            <p className="feature-card-text">
              Go beyond pre-recorded videos with live, interactive sessions
              where you can ask questions and get instant feedback from real
              instructors.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <HiOutlineBookOpen />
            </div>
            <h3 className="feature-card-title">Expert-Led Studios</h3>
            <p className="feature-card-text">
              Explore and subscribe to studios led by passionate educators, each
              with their own unique teaching style and carefully crafted lesson
              content.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon">
              <HiOutlineUsers />
            </div>
            <h3 className="feature-card-title">Integrated Community</h3>
            <p className="feature-card-text">
              Learn alongside your peers in the SquadHUB, our dedicated space
              for meaningful discussions, collaborative projects, and peer
              support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForLearnersSection;
