import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ATSScoreCard } from "../ATSScoreCard";

describe("ATSScoreCard Component", () => {
  it("renders score correctly", () => {
    render(<ATSScoreCard score={85} label="ATS Score" />);

    // The score is displayed with % in same element, so look for "85%"
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("ATS Score")).toBeInTheDocument();
  });

  it("displays label correctly", () => {
    render(<ATSScoreCard score={75} label="Original Score" />);

    expect(screen.getByText("Original Score")).toBeInTheDocument();
  });

  it("renders with 'before' variant styling", () => {
    const { container } = render(<ATSScoreCard score={60} label="Before" variant="before" />);

    // Component should render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with 'after' variant styling", () => {
    const { container } = render(<ATSScoreCard score={90} label="After" variant="after" />);

    // Component should render without errors
    expect(container.firstChild).toBeInTheDocument();
  });

  it("handles zero score", () => {
    render(<ATSScoreCard score={0} label="Score" />);

    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("handles 100 score", () => {
    render(<ATSScoreCard score={100} label="Perfect Score" />);

    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
