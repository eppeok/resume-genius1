import { Progress } from "@/components/ui/progress";
import { Target, FileCheck, Layout, BookOpen } from "lucide-react";

interface ScoreBreakdownProps {
  keywordMatch: number;
  formatting: number;
  sections: number;
  readability: number;
  variant?: "before" | "after";
}

const metrics = [
  { key: "keywordMatch", label: "Keyword Match", icon: Target, weight: "40%" },
  { key: "formatting", label: "ATS Formatting", icon: FileCheck, weight: "20%" },
  { key: "sections", label: "Section Completeness", icon: Layout, weight: "25%" },
  { key: "readability", label: "Readability", icon: BookOpen, weight: "15%" },
] as const;

export function ScoreBreakdown({ keywordMatch, formatting, sections, readability, variant = "before" }: ScoreBreakdownProps) {
  const scores = { keywordMatch, formatting, sections, readability };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-gradient-primary";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-4">
      {metrics.map(({ key, label, icon: Icon, weight }) => {
        const score = scores[key];
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {label}
                <span className="text-xs text-muted-foreground">({weight})</span>
              </span>
              <span className={variant === "after" ? "font-semibold" : ""}>{score}%</span>
            </div>
            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${getProgressColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
