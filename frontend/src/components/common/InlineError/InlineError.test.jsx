// frontend/src/components/common/InlineError/InlineError.test.jsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import InlineError from "./InlineError";

// We use a 'describe' block to group all tests related to the InlineError component.
describe("InlineError Component", () => {
  // Test Case 1: Verifying that the component renders correctly when a message is provided.
  it("should render the error message when a message prop is passed", () => {
    // Arrange: Define the error message we want to test with.
    const errorMessage = "This is a test error.";

    // Act: Render the component, passing our error message as a prop.
    render(<InlineError message={errorMessage} />);

    // Assert: Check if the text 'This is a test error.' is now visible on the screen.
    // getByText will throw an error if the text is not found, making the test fail.
    const messageElement = screen.getByText(errorMessage);
    expect(messageElement).toBeInTheDocument();
  });

  // Test Case 2: Verifying that the component renders nothing when no message is provided.
  it("should render nothing when the message prop is null or empty", () => {
    // Arrange: We will render the component without a message prop.

    // Act: Render the component with no props.
    const { container } = render(<InlineError />);

    // Assert: We check that the component's container is empty.
    // This confirms our logic to return 'null' when there is no message.
    expect(container.firstChild).toBeNull();
  });

  // An alternative way to write Test Case 2.
  it("should not render any text when the message prop is not provided", () => {
    // Arrange & Act: Render the component.
    render(<InlineError />);

    // Assert: We use 'queryByText' because unlike 'getByText', it returns null
    // instead of throwing an error if the text is not found.
    const nonExistentMessage = screen.queryByText(/.+/); // A regex to match any text
    expect(nonExistentMessage).not.toBeInTheDocument();
  });
});
