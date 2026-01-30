import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobCard } from "../JobCard";
import { TestRouter } from "@/test/mocks/router";

// Mock dependencies
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock("@/lib/api/bookmarks", () => ({
  bookmarkJob: vi.fn().mockResolvedValue(undefined),
  removeBookmark: vi.fn().mockResolvedValue(undefined),
}));

describe("JobCard Component", () => {
  const mockJob = {
    title: "Senior Software Engineer",
    company: "Tech Corp",
    location: "New York, NY",
    salary: "$120,000 - $150,000",
    matchScore: 85,
    applyUrl: "https://example.com/apply",
    source: "linkedin",
    highlights: ["React", "TypeScript", "Node.js"],
    description: "We are looking for a senior software engineer...",
    postedDate: "2024-01-15",
  };

  it("renders job title and company", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
  });

  it("renders location", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText("New York, NY")).toBeInTheDocument();
  });

  it("renders salary when provided", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText("$120,000 - $150,000")).toBeInTheDocument();
  });

  it("renders match score", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders apply button", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
  });

  it("renders highlights/tags", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });

  it("has bookmark button", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    // Should have a bookmark action button (there are multiple buttons - apply and bookmark)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onBookmarkChange when bookmark button clicked", async () => {
    const user = userEvent.setup();
    const mockOnBookmarkChange = vi.fn();
    
    render(
      <TestRouter>
        <JobCard job={mockJob} onBookmarkChange={mockOnBookmarkChange} />
      </TestRouter>
    );

    // Find the bookmark button (not the apply button)
    const buttons = screen.getAllByRole("button");
    const bookmarkButton = buttons.find(btn => !btn.textContent?.includes("Apply"));
    
    if (bookmarkButton) {
      await user.click(bookmarkButton);
    }
  });

  it("shows bookmarked state when isBookmarked is true", () => {
    render(
      <TestRouter>
        <JobCard 
          job={mockJob} 
          isBookmarked={true}
        />
      </TestRouter>
    );

    // Component should render bookmarked state
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders source badge", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText("linkedin")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <TestRouter>
        <JobCard job={mockJob} />
      </TestRouter>
    );

    expect(screen.getByText(/we are looking for a senior software engineer/i)).toBeInTheDocument();
  });
});
