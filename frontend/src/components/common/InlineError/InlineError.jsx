// frontend/src/components/common/InlineError/InlineError.jsx
import { HiExclamationCircle } from "react-icons/hi";
import "./InlineError.css";

/**
 * A reusable component to display a styled inline error message.
 * @param {{message: string}} props - The component props.
 * @param {string} props.message - The error message to display.
 */
const InlineError = ({ message }) => {
  // If no message is provided, the component renders nothing.
  if (!message) {
    return null;
  }

  return (
    <div className="inline-error-container">
      <HiExclamationCircle className="inline-error-icon" />
      <span className="inline-error-message">{message}</span>
    </div>
  );
};

export default InlineError;
