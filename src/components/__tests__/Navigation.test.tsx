import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navigation } from "../Navigation";
import { TestRouter } from "@/test/mocks/router";

// Mock dependencies for authenticated user
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      id: "test-user-id",
      email: "test@example.com",
      full_name: "Test User",
      credits: 5,
    },
    user: { id: "test-user-id", email: "test@example.com" },
    session: { access_token: "mock-token" },
    isLoading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/hooks/useIsAdmin", () => ({
  useIsAdmin: () => ({ isAdmin: false, isLoading: false }),
}));

describe("Navigation Component", () => {
  it("renders logo and brand name", () => {
    render(
      <TestRouter>
        <Navigation />
      </TestRouter>
    );

    expect(screen.getByText(/evolvxtalent/i)).toBeInTheDocument();
  });

  it("shows dashboard link for authenticated users", () => {
    render(
      <TestRouter>
        <Navigation />
      </TestRouter>
    );

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("shows optimize link for authenticated users", () => {
    render(
      <TestRouter>
        <Navigation />
      </TestRouter>
    );

    expect(screen.getByRole("link", { name: /optimize/i })).toBeInTheDocument();
  });

  it("shows jobs link for authenticated users", () => {
    render(
      <TestRouter>
        <Navigation />
      </TestRouter>
    );

    expect(screen.getByRole("link", { name: /jobs/i })).toBeInTheDocument();
  });

  it("displays user credits count", () => {
    render(
      <TestRouter>
        <Navigation />
      </TestRouter>
    );

    // Credits should be displayed somewhere
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
