import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResumeForm } from "../ResumeForm";

// Mock dependencies
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
    user: null,
    session: null,
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/parseResume", () => ({
  parseResumeFile: vi.fn().mockResolvedValue("Parsed resume content"),
  getSupportedFileTypes: () => ".pdf,.docx,.txt",
}));

describe("ResumeForm Component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form sections", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    expect(screen.getByText(/target position/i)).toBeInTheDocument();
    expect(screen.getByText(/your current resume/i)).toBeInTheDocument();
  });

  it("renders personal info fields", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
  });

  it("renders target job fields", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/target role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
  });

  it("renders resume upload section", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByText(/upload pdf, docx, or txt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/resume content/i)).toBeInTheDocument();
  });

  it("submit button is disabled when required fields are empty", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    const submitButton = screen.getByRole("button", { name: /generate ats-optimized resume/i });
    expect(submitButton).toBeDisabled();
  });

  it("submit button is enabled when all required fields are filled", async () => {
    const user = userEvent.setup();
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/full name/i), "John Doe");
    await user.type(screen.getByLabelText(/target role/i), "Software Engineer");
    await user.type(screen.getByLabelText(/job description/i), "We are looking for...");
    await user.type(screen.getByLabelText(/resume content/i), "My resume content...");

    const submitButton = screen.getByRole("button", { name: /generate ats-optimized resume/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("calls onSubmit with form data when submitted", async () => {
    const user = userEvent.setup();
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/full name/i), "John Doe");
    await user.type(screen.getByLabelText(/target role/i), "Software Engineer");
    await user.type(screen.getByLabelText(/job description/i), "We are looking for...");
    await user.type(screen.getByLabelText(/resume content/i), "My resume content...");

    const submitButton = screen.getByRole("button", { name: /generate ats-optimized resume/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      fullName: "John Doe",
      targetRole: "Software Engineer",
      jobDescription: "We are looking for...",
      currentResume: "My resume content...",
    }));
  });

  it("shows loading state when isLoading is true", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={true} />);

    // Button should show loading text
    expect(screen.getByText(/optimizing resume/i)).toBeInTheDocument();
  });

  it("auto-fills profile data on mount", async () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    await waitFor(() => {
      // Profile data should be auto-filled
      expect(screen.getByLabelText(/full name/i)).toHaveValue("Test User");
      expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
    });
  });

  it("has file input for resume upload", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    const fileInput = document.getElementById("resumeFile") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe("file");
    expect(fileInput.accept).toContain(".pdf");
  });

  it("has max length restrictions on inputs", () => {
    render(<ResumeForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("maxLength", "100");
    expect(screen.getByLabelText(/current role/i)).toHaveAttribute("maxLength", "100");
    expect(screen.getByLabelText(/location/i)).toHaveAttribute("maxLength", "100");
  });
});
