// In frontend/src/components/common/AuthLink.jsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * A wrapper around the react-router-dom Link component that checks for authentication.
 * If the user is not logged in, it redirects them to the signup page.
 * Otherwise, it functions as a normal link.
 */
const AuthLink = ({ to, children, ...props }) => {
  const { user } = useAuth(); // Get the current user from our "Power Station"
  const navigate = useNavigate();

  const handleClick = (e) => {
    // If there is NO user, we intercept the click.
    if (!user) {
      e.preventDefault(); // Stop the link from navigating to its 'to' destination.
      navigate("/signup"); // Redirect to the signup page instead.
    }
    // If there IS a user, this function does nothing, and the link behaves normally.
  };

  return (
    <Link to={to} {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default AuthLink;
