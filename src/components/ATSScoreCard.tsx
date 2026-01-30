import { cn } from "@/lib/utils";

interface ATSScoreCardProps {
  score: number;
  label: string;
  variant?: "before" | "after";
  size?: "sm" | "lg";
}

export function ATSScoreCard({ score, label, variant = "before", size = "lg" }: ATSScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-success";
    if (score >= 60) return "stroke-warning";
    return "stroke-destructive";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizeClasses = {
    sm: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn(getStrokeColor(score), "transition-all duration-1000 ease-out")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", textSizeClasses[size], getScoreColor(score))}>
            {score}%
          </span>
        </div>
      </div>
      <span className={cn(
        "text-sm font-medium",
        variant === "before" ? "text-muted-foreground" : "text-foreground"
      )}>
        {label}
      </span>
    </div>
  );
}
