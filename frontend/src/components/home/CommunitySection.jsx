// frontend/src/components/home/CommunitySection.jsx

import { Link } from "react-router-dom";
import { HiChatAlt2, HiBookOpen, HiUsers, HiArrowRight } from "react-icons/hi";
import SquadHubLogo from "../../assets/SquadHUB_logo.png";
import { useAuth } from "../../context/AuthContext"; // We need our auth hook.
import "./CommunitySection.css";

const CommunitySection = () => {
  // Get the isTeacher function from our context.
  const { isTeacher } = useAuth();

  const features = [
    {
      icon: HiChatAlt2,
      title: "Community Discussions",
      description:
        "Engage in meaningful conversations and share insights with fellow learners.",
    },
    {
      icon: HiBookOpen,
      title: "Resource Sharing",
      description:
        "Access and contribute to a growing library of educational materials and notes.",
    },
    {
      icon: HiUsers,
      title: "Study Groups",
      description:
        "Connect with study partners and form collaborative learning groups.",
    },
  ];

  return (
    <section className="community-section">
      <div className="community-container">
        <div className="community-header">
          <div className="community-logo-wrapper">
            <img
              src={SquadHubLogo}
              alt="SquadHUB Logo"
              className="community-logo"
            />
          </div>
          <div className="community-intro">
            {/* --- DYNAMIC TEXT --- */}
            {isTeacher() ? (
              <>
                {/* This is the view for logged-in teachers. */}
                <h2 className="community-headline">
                  Engage with Your{" "}
                  <span className="highlight-text">Community</span>
                </h2>
                <p className="community-description">
                  See what students are discussing, answer their questions, and
                  build your reputation as an expert in the SquadHUB.
                </p>
              </>
            ) : (
              <>
                {/* This is the default view for guests and learners. */}
                <h2 className="community-headline">
                  Discover <span className="highlight-text">SquadHUB</span>
                </h2>
                <p className="community-description">
                  SquadHUB is our integrated blog and community space where
                  learners can share experiences, discuss topics, and connect
                  with others.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="community-features-section">
          <div className="community-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="community-feature-card">
                <div className="community-feature-icon-wrapper">
                  <feature.icon className="community-feature-icon" />
                </div>
                <h4 className="community-feature-title">{feature.title}</h4>
                <p className="community-feature-description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="community-cta-section">
          <div className="cta-content">
            <h3 className="cta-title">Ready to Explore?</h3>
            <p className="cta-subtitle">
              Join the conversation and discover what the community is
              discussing.
            </p>
            <Link to="/squadhub" className="btn btn-primary-cta">
              <span>Visit SquadHUB</span>
              <HiArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
