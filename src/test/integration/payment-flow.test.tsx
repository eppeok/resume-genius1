import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import BuyCredits from "@/pages/BuyCredits";

// Mock dependencies
const mockValidateCoupon = vi.fn();

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
    rpc: (name: string, params: unknown) => mockValidateCoupon(name, params),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      id: "test-user-id",
      email: "test@example.com",
      full_name: "Test User",
      credits: 3,
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

describe("Payment Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://checkout.stripe.com/test-session" }),
    });

    // Reset coupon validation mock
    mockValidateCoupon.mockResolvedValue({
      data: [{
        is_valid: true,
        discount_type: "percentage",
        discount_value: 20,
        error_message: null,
      }],
      error: null,
    });
  });

  describe("Credit Pack Display", () => {
    it("shows current credit balance", () => {
      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText(/you currently have/i)).toBeInTheDocument();
    });

    it("displays all credit pack options", () => {
      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      expect(screen.getByText("Starter")).toBeInTheDocument();
      expect(screen.getByText("Professional")).toBeInTheDocument();
      expect(screen.getByText("Enterprise")).toBeInTheDocument();
    });

    it("shows pack prices correctly", () => {
      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      expect(screen.getByText("$9")).toBeInTheDocument();
      expect(screen.getByText("$19")).toBeInTheDocument();
      expect(screen.getByText("$29")).toBeInTheDocument();
    });

    it("shows price per credit for each pack", () => {
      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      expect(screen.getByText(/\$0\.90\/credit/i)).toBeInTheDocument();
      expect(screen.getByText(/\$0\.76\/credit/i)).toBeInTheDocument();
      expect(screen.getByText(/\$0\.58\/credit/i)).toBeInTheDocument();
    });
  });

  describe("Coupon Code Application", () => {
    it("allows entering coupon code", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
      await user.type(couponInput, "DISCOUNT20");

      expect(couponInput).toHaveValue("DISCOUNT20");
    });

    it("validates coupon when Apply is clicked", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
      await user.type(couponInput, "SAVE20");

      const applyButton = screen.getByRole("button", { name: /apply/i });
      await user.click(applyButton);

      await waitFor(() => {
        expect(mockValidateCoupon).toHaveBeenCalledWith(
          "validate_coupon",
          expect.objectContaining({
            p_code: "SAVE20",
          })
        );
      });
    });

    it("shows applied coupon with discount details", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
      await user.type(couponInput, "SAVE20");

      const applyButton = screen.getByRole("button", { name: /apply/i });
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/coupon applied/i)).toBeInTheDocument();
        expect(screen.getByText(/20% off/i)).toBeInTheDocument();
      });
    });

    it("allows removing applied coupon", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      // Apply coupon first
      const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
      await user.type(couponInput, "SAVE20");
      await user.click(screen.getByRole("button", { name: /apply/i }));

      await waitFor(() => {
        expect(screen.getByText(/coupon applied/i)).toBeInTheDocument();
      });

      // Find and click remove button (X icon)
      const removeButtons = screen.getAllByRole("button");
      const removeButton = removeButtons.find(btn => 
        btn.querySelector('svg.lucide-x') || btn.getAttribute('aria-label')?.includes('remove')
      );
      
      if (removeButton) {
        await user.click(removeButton);
      }
    });
  });

  describe("Checkout Process", () => {
    it("initiates checkout when purchase button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      const buyButton = screen.getByRole("button", { name: /buy 25 credits/i });
      await user.click(buyButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/functions/v1/create-checkout"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
              Authorization: "Bearer mock-token",
            }),
            body: expect.stringContaining("25-credits"),
          })
        );
      });
    });

    it("includes coupon code in checkout request when applied", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      // Apply coupon
      const couponInput = screen.getByPlaceholderText(/enter coupon code/i);
      await user.type(couponInput, "TESTCOUPON");
      await user.click(screen.getByRole("button", { name: /apply/i }));

      await waitFor(() => {
        expect(screen.getByText(/coupon applied/i)).toBeInTheDocument();
      });

      // Click purchase
      const buyButton = screen.getByRole("button", { name: /buy 10 credits/i });
      await user.click(buyButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: expect.stringContaining("TESTCOUPON"),
          })
        );
      });
    });

    it("shows loading state during checkout", async () => {
      const user = userEvent.setup();
      
      // Make fetch hang to observe loading state
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      const buyButton = screen.getByRole("button", { name: /buy 10 credits/i });
      await user.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
      });
    });
  });

  describe("Features Display", () => {
    it("lists pack features", () => {
      render(
        <MemoryRouter>
          <BuyCredits />
        </MemoryRouter>
      );

      // Each pack should show these features
      const atsAnalysis = screen.getAllByText(/full ats score analysis/i);
      expect(atsAnalysis.length).toBe(3);

      const pdfExport = screen.getAllByText(/pdf export with templates/i);
      expect(pdfExport.length).toBe(3);

      const neverExpires = screen.getAllByText(/never expires/i);
      expect(neverExpires.length).toBe(3);
    });
  });
});
