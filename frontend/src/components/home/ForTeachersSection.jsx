// frontend/src/components/home/ForTeachersSection.jsx

import { Link } from "react-router-dom";
import {
  HiOutlinePencilAlt,
  HiOutlineUsers,
  HiOutlineVideoCamera,
  HiCollection,
  HiPlusCircle,
} from "react-icons/hi";
import teacherVisual from "../../assets/teacherVisual.jpg";
import { useAuth } from "../../context/AuthContext";
import "./ForTeachersSection.css";

const ForTeachersSection = () => {
  // We get the isTeacher function from our AuthContext.
  const { isTeacher } = useAuth();

  return (
    <section className="teachers-section">
      <div className="teachers-container">
        <div className="teachers-content">
          <h2 className="section-headline">
            Share Your Passion. Build Your Legacy.
          </h2>
          <p className="section-subheadline">
            Turn your knowledge into impact. Imagine reaching students worldwide
            from your own professional studio.
          </p>
          <ul className="features-list">
            <li>
              <HiOutlinePencilAlt className="feature-icon" /> Build Your Studio:
              Create your own branded space.
            </li>
            <li>
              <HiOutlineUsers className="feature-icon" /> Engage with Learners:
              Connect directly with students.
            </li>
            <li>
              <HiOutlineVideoCamera className="feature-icon" /> Host Live
              Sessions: Teach and interact in real-time.
            </li>
            <li>
              <HiCollection className="feature-icon" /> Design Rich Courses:
              Craft engaging lessons with our intuitive tools.
            </li>
          </ul>

          {/* --- DYNAMIC BUTTON --- */}
          {/* We check if the user is a teacher. */}
          {isTeacher() ? (
            // If they are a teacher, the button invites them to create content for their studio.
            <Link to="/my-studio" className="btn btn-cta-primary">
              Craft a New Lesson <HiPlusCircle className="btn-icon" />
            </Link>
          ) : (
            // Otherwise, the button invites them to sign up and become a teacher.
            <Link to="/signup" className="btn btn-cta-primary">
              Start Teaching Today
            </Link>
          )}
        </div>
        <div className="teachers-visual">
          <img src={teacherVisual} alt="Teacher giving an online course" />
        </div>
      </div>
    </section>
  );
};

export default ForTeachersSection;
