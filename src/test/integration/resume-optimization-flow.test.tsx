import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ResumeForm } from "@/components/ResumeForm";

// Mock dependencies
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      id: "test-user-id",
      email: "test@example.com",
      full_name: "Test User",
      credits: 5,
      phone: "+1-555-123-4567",
      location: "New York, NY",
      linkedin_url: "https://linkedin.com/in/testuser",
      referral_code: null,
    },
    user: { id: "test-user-id", email: "test@example.com" },
    session: { access_token: "mock-token" },
    isLoading: false,
    refreshProfile: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/parseResume", () => ({
  parseResumeFile: vi.fn().mockResolvedValue("Parsed resume content from file"),
  getSupportedFileTypes: () => ".pdf,.docx,.txt",
}));

describe("Resume Optimization Flow Integration", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Auto-fill", () => {
    it("auto-fills user profile data on mount", async () => {
      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={false} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toHaveValue("Test User");
        expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
        expect(screen.getByLabelText(/phone/i)).toHaveValue("+1-555-123-4567");
        expect(screen.getByLabelText(/location/i)).toHaveValue("New York, NY");
      });
    });
  });

  describe("Complete Form Submission", () => {
    it("submits form with all required data", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={false} />
        </MemoryRouter>
      );

      // Wait for auto-fill
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toHaveValue("Test User");
      });

      // Fill remaining required fields
      await user.type(screen.getByLabelText(/target role/i), "Senior Software Engineer");
      await user.type(
        screen.getByLabelText(/job description/i),
        "We are looking for an experienced software engineer with React and Node.js expertise..."
      );
      await user.type(
        screen.getByLabelText(/resume content/i),
        "JOHN DOE\nSoftware Engineer\n\nEXPERIENCE\n- Built web applications..."
      );

      // Submit form
      const submitButton = screen.getByRole("button", { name: /generate ats-optimized resume/i });
      expect(submitButton).not.toBeDisabled();
      
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        fullName: "Test User",
        email: "test@example.com",
        targetRole: "Senior Software Engineer",
        currentResume: expect.stringContaining("JOHN DOE"),
        jobDescription: expect.stringContaining("experienced software engineer"),
      }));
    });
  });

  describe("Form Validation", () => {
    it("disables submit button until all required fields are filled", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={false} />
        </MemoryRouter>
      );

      const submitButton = screen.getByRole("button", { name: /generate ats-optimized resume/i });
      
      // Initially disabled (missing target role, job description, resume)
      expect(submitButton).toBeDisabled();

      // Fill target role
      await user.type(screen.getByLabelText(/target role/i), "Developer");
      expect(submitButton).toBeDisabled();

      // Fill job description
      await user.type(screen.getByLabelText(/job description/i), "Job requirements...");
      expect(submitButton).toBeDisabled();

      // Fill resume content
      await user.type(screen.getByLabelText(/resume content/i), "My resume...");
      
      // Now should be enabled
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("shows loading state during optimization", () => {
      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={true} />
        </MemoryRouter>
      );

      expect(screen.getByText(/optimizing resume/i)).toBeInTheDocument();
    });

    it("disables form during loading", () => {
      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={true} />
        </MemoryRouter>
      );

      const submitButton = screen.getByRole("button", { name: /optimizing resume/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Optional Fields", () => {
    it("allows submission with optional fields empty", async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={false} />
        </MemoryRouter>
      );

      // Clear auto-filled optional fields
      const phoneInput = screen.getByLabelText(/phone/i);
      const locationInput = screen.getByLabelText(/location/i);
      
      await user.clear(phoneInput);
      await user.clear(locationInput);

      // Fill required fields
      await user.type(screen.getByLabelText(/target role/i), "Engineer");
      await user.type(screen.getByLabelText(/job description/i), "Description");
      await user.type(screen.getByLabelText(/resume content/i), "Resume");

      const submitButton = screen.getByRole("button", { name: /generate ats-optimized resume/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("File Upload Section", () => {
    it("displays file upload UI", () => {
      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={false} />
        </MemoryRouter>
      );

      expect(screen.getByText(/upload pdf, docx, or txt/i)).toBeInTheDocument();
    });

    it("has hidden file input with correct accept types", () => {
      render(
        <MemoryRouter>
          <ResumeForm onSubmit={mockOnSubmit} isLoading={false} />
        </MemoryRouter>
      );

      const fileInput = document.getElementById("resumeFile") as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.accept).toContain(".pdf");
      expect(fileInput.accept).toContain(".docx");
      expect(fileInput.accept).toContain(".txt");
    });
  });
});
