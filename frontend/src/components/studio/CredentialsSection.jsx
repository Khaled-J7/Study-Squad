// frontend/src/components/studio/CredentialsSection.jsx

import React from "react";
import { Award, Download } from "lucide-react";
import "./CredentialsSection.css";

const CredentialsSection = ({ profile }) => {
  // We only render the component if there's a CV or at least one degree.
  if (
    !profile ||
    (!profile.cv_file && (!profile.degrees || profile.degrees.length === 0))
  ) {
    return null;
  }

  return (
    <section className="credentials-section">
      <div className="credentials-content">
        {profile.degrees && profile.degrees.length > 0 && (
          <div className="degrees-list">
            <h4>Degrees & Certifications</h4>
            <ul>
              {profile.degrees.map((degree, index) => (
                <li key={index}>
                  <Award size={16} className="credential-icon" />
                  <span>{degree}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {profile.cv_file && (
          <div className="cv-download">
            <a
              href={profile.cv_file}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Download size={18} />
              <span>Download CV</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default CredentialsSection;
