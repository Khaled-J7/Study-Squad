// frontend/src/pages/ProfilePage.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProfilePage from "./ProfilePage";
import { AuthContext } from "../context/AuthContext";

// We need to "mock" the AuthContext because our test environment doesn't have a real logged-in user.
// This creates a fake version of the context that we can control.
const mockAuthContext = {
  user: {
    username: "khaledjallouli",
    first_name: "Khaled",
    last_name: "Jallouli",
    email: "khaled@example.com",
    profile: {
      about_me: "A test bio.",
      contact_email: "contact@example.com",
      profile_picture: "/media/profile_pics/default.jpg",
    },
  },
  isTeacher: () => false, // We'll pretend the user is a learner for this test
};

// This is the main container for all tests related to the ProfilePage.
describe("ProfilePage", () => {
  // Our first test case.
  it("should render the user information correctly in view mode", () => {
    // --- ARRANGE ---
    // We render the ProfilePage component.
    // We MUST wrap it in two things:
    // 1. BrowserRouter: because the component uses the <Link> component.
    // 2. AuthContext.Provider: to provide our fake user data to the component.
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <ProfilePage />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // --- ASSERT ---
    // Now we check if the information from our 'mockAuthContext' is visible on the screen.
    // We use regular expressions with '/i' to make the search case-insensitive.
    expect(screen.getByText(/Khaled Jallouli/i)).toBeInTheDocument();
    expect(screen.getByText(/@khaledjallouli/i)).toBeInTheDocument();
    expect(screen.getByText(/A test bio./i)).toBeInTheDocument();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    expect(screen.getByText("Become a Teacher")).toBeInTheDocument();
  });
});
