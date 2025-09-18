// frontend/src/components/Footer.jsx
import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  const handleAppStoreClick = (e) => {
    e.preventDefault();
    alert("Our mobile app is coming soon! Stay tuned.");
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Column 1: Brand & Mission */}
        <div className="footer-column">
          <Link to="/" className="footer-brand">
            <img src="/StudySquadMainLogo.png" alt="Study Squad Logo" />
            <span>Study Squad</span>
          </Link>
          <p className="mission-statement">
            Connecting curious minds with passionate educators, worldwide.
          </p>
          <div className="app-store-links">
            <a href="#" onClick={handleAppStoreClick}>
              <img src="/app-store-badge.svg" alt="Download on the App Store" />
            </a>
            <a href="#" onClick={handleAppStoreClick}>
              <img src="/google-play-badge.svg" alt="Get it on Google Play" />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/explore">Explore</Link>
            </li>
            <li>
              <Link to="/squadhub">SquadHUB</Link>
            </li>
            <li>
              <Link to="/studio/onboarding">Become a Teacher</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Social & Legal */}
        <div className="footer-column">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#">
              <FaInstagram />
            </a>
            <a href="#">
              <FaTwitter />
            </a>
            <a href="#">
              <FaFacebookF />
            </a>
            <a href="#">
              <FaYoutube />
            </a>
          </div>
          <h4 className="legal-heading">Legal</h4>
          <ul>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <p>© 2025 Study Squad. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
