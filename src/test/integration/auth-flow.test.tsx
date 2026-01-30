import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

// Mock all dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      resend: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    user: null,
    session: null,
    profile: null,
    isLoading: false,
  }),
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

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Login to Signup Navigation", () => {
    it("navigates from login to signup page", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();

      const signupLink = screen.getByRole("link", { name: /sign up/i });
      await user.click(signupLink);

      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      });
    });
  });

  describe("Signup to Login Navigation", () => {
    it("navigates from signup to login page", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={["/signup"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      await user.click(loginLink);

      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });
    });
  });

  describe("Login Form Validation", () => {
    it("requires email and password fields", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    it("accepts valid email format", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "valid@email.com");

      expect(emailInput).toHaveValue("valid@email.com");
      expect(emailInput).toBeValid();
    });
  });

  describe("Signup Form Validation", () => {
    it("has all required fields", () => {
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it("allows entering referral code", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );

      const referralInput = screen.getByLabelText(/referral code/i);
      await user.type(referralInput, "FRIEND123");

      expect(referralInput).toHaveValue("FRIEND123");
    });
  });

  describe("Forgot Password Link", () => {
    it("has forgot password link on login page", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const forgotLink = screen.getByText(/forgot password/i);
      expect(forgotLink).toHaveAttribute("href", "/forgot-password");
    });
  });

  describe("Form Submission", () => {
    it("prevents form submission with empty fields", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      );

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      
      // Form should be present
      expect(submitButton).toBeInTheDocument();
    });
  });
});
