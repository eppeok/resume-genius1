import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreBreakdown } from "../ScoreBreakdown";

describe("ScoreBreakdown Component", () => {
  const defaultProps = {
    keywordMatch: 80,
    formatting: 75,
    sections: 90,
    readability: 85,
  };

  it("renders all score categories", () => {
    render(<ScoreBreakdown {...defaultProps} />);

    expect(screen.getByText(/keyword match/i)).toBeInTheDocument();
    expect(screen.getByText(/formatting/i)).toBeInTheDocument();
    expect(screen.getByText(/section/i)).toBeInTheDocument();
    expect(screen.getByText(/readability/i)).toBeInTheDocument();
  });

  it("displays score values", () => {
    render(<ScoreBreakdown {...defaultProps} />);

    // Use getAllByText since scores may appear multiple times
    expect(screen.getAllByText(/80%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/75%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/90%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/85%/).length).toBeGreaterThan(0);
  });

  it("renders with 'before' variant", () => {
    const { container } = render(<ScoreBreakdown {...defaultProps} variant="before" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with 'after' variant", () => {
    const { container } = render(<ScoreBreakdown {...defaultProps} variant="after" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("handles low scores", () => {
    render(
      <ScoreBreakdown
        keywordMatch={20}
        formatting={15}
        sections={25}
        readability={30}
      />
    );

    // Use getAllByText since scores may appear in weight percentages too
    expect(screen.getAllByText(/20%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/15%/).length).toBeGreaterThan(0);
  });

  it("handles perfect scores", () => {
    render(
      <ScoreBreakdown
        keywordMatch={100}
        formatting={100}
        sections={100}
        readability={100}
      />
    );

    const perfectScores = screen.getAllByText(/100%/);
    expect(perfectScores.length).toBeGreaterThanOrEqual(4);
  });
});
