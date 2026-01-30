import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuyCredits from "../BuyCredits";
import { TestRouter } from "@/test/mocks/router";

// Mock dependencies
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: "mock-token",
            user: { id: "test-user-id", email: "test@example.com" },
          },
        },
        error: null,
      }),
    },
    rpc: vi.fn().mockResolvedValue({
      data: [{
        is_valid: true,
        discount_type: "percentage",
        discount_value: 20,
        error_message: null,
      }],
      error: null,
    }),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      id: "test-user-id",
      email: "test@example.com",
      full_name: "Test User",
      credits: 5,
      phone: null,
      location: null,
      linkedin_url: null,
      referral_code: null,
    },
    refreshProfile: vi.fn(),
    user: { id: "test-user-id", email: "test@example.com" },
    session: { access_token: "mock-token" },
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch for edge function calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ url: "https://checkout.stripe.com/test" }),
});

describe("BuyCredits Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title and current credits", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText(/buy credits/i)).toBeInTheDocument();
    expect(screen.getByText(/you currently have/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Current credits
  });

  it("displays all three credit packs", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("displays correct pricing for each pack", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText("$9")).toBeInTheDocument();
    expect(screen.getByText("$19")).toBeInTheDocument();
    expect(screen.getByText("$29")).toBeInTheDocument();
  });

  it("displays credit counts for each pack", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText(/10 resume optimizations/i)).toBeInTheDocument();
    expect(screen.getByText(/25 resume optimizations/i)).toBeInTheDocument();
    expect(screen.getByText(/50 resume optimizations/i)).toBeInTheDocument();
  });

  it("highlights Professional pack as most popular", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText(/most popular/i)).toBeInTheDocument();
  });

  it("has purchase buttons for each pack", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByRole("button", { name: /buy 10 credits/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buy 25 credits/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buy 50 credits/i })).toBeInTheDocument();
  });

  it("has coupon code input", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByPlaceholderText(/enter coupon code/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
  });

  it("allows entering coupon code", async () => {
    const user = userEvent.setup();
    
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
    await user.type(couponInput, "SAVE20");

    expect(couponInput).toHaveValue("SAVE20");
  });

  it("converts coupon code to uppercase", async () => {
    const user = userEvent.setup();
    
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
    await user.type(couponInput, "save20");

    expect(couponInput).toHaveValue("SAVE20");
  });

  it("displays feature list for each pack", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    // Check features are listed
    const features = screen.getAllByText(/full ats score analysis/i);
    expect(features.length).toBe(3); // One for each pack

    const pdfExport = screen.getAllByText(/pdf export with templates/i);
    expect(pdfExport.length).toBe(3);

    const neverExpires = screen.getAllByText(/never expires/i);
    expect(neverExpires.length).toBe(3);
  });

  it("shows transaction history link", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText(/view transaction history/i)).toBeInTheDocument();
  });

  it("displays Stripe security note", () => {
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    expect(screen.getByText(/secure payment powered by stripe/i)).toBeInTheDocument();
  });

  it("calls checkout endpoint when purchase button is clicked", async () => {
    const user = userEvent.setup();
    
    render(
      <TestRouter>
        <BuyCredits />
      </TestRouter>
    );

    const buyButton = screen.getByRole("button", { name: /buy 10 credits/i });
    await user.click(buyButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/functions/v1/create-checkout"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("10-credits"),
        })
      );
    });
  });
});
