import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "../Signup";
import { TestRouter } from "@/test/mocks/router";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signUp: vi.fn(),
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("Signup Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form with all required fields", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("displays EvolvXTalent branding", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByText(/evolvxtalent/i)).toBeInTheDocument();
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  });

  it("has referral code field", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByLabelText(/referral code/i)).toBeInTheDocument();
  });

  it("allows user to fill signup form", async () => {
    const user = userEvent.setup();
    
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    await user.type(screen.getByLabelText(/full name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Password123!");
    await user.type(screen.getByLabelText(/confirm password/i), "Password123!");

    expect(screen.getByLabelText(/full name/i)).toHaveValue("John Doe");
    expect(screen.getByLabelText(/email/i)).toHaveValue("john@example.com");
  });

  it("has link to login page", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  it("has link to terms of service", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByRole("link", { name: /terms of service/i })).toBeInTheDocument();
  });

  it("has link to privacy policy", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByRole("link", { name: /privacy policy/i })).toBeInTheDocument();
  });

  it("shows 3 free credits benefit", () => {
    render(
      <TestRouter>
        <Signup />
      </TestRouter>
    );

    expect(screen.getByText(/3 free credits/i)).toBeInTheDocument();
  });
});
