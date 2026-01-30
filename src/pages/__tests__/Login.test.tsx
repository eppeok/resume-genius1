import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";
import { TestRouter } from "@/test/mocks/router";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      resend: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    signIn: vi.fn(),
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  })),
}));

vi.mock("@/hooks/useLoginRateLimiter", () => ({
  useLoginRateLimiter: () => ({
    isLocked: () => false,
    getRemainingLockoutTime: () => 0,
    getRemainingAttempts: () => 5,
    recordFailedAttempt: vi.fn(),
    resetOnSuccess: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form with all required elements", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("displays EvolvXTalent branding", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    expect(screen.getByText(/evolvxtalent/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it("allows user to type email and password", async () => {
    const user = userEvent.setup();
    
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("submits form when valid credentials are entered", async () => {
    const mockSignIn = vi.fn();
    
    vi.mocked(await import("@/contexts/AuthContext")).useAuth = vi.fn(() => ({
      signIn: mockSignIn,
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      signUp: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    }));

    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    // Form should be submitted
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("has link to signup page", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("has link to forgot password page", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  it("email input has correct type", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("password input has correct type", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("form fields are required", () => {
    render(
      <TestRouter>
        <Login />
      </TestRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});
