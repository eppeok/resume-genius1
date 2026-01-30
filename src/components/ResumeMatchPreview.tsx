import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ResumeMatchPreviewProps {
  resume: string;
  jobDescription: string;
}

interface MatchResult {
  score: number;
  assessment: string;
  topMissingKeywords: string[];
}

// Simple hash function for caching
function hashInputs(resume: string, jobDescription: string): string {
  const combined = `${resume.slice(0, 500)}|${jobDescription.slice(0, 500)}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

export function ResumeMatchPreview({ resume, jobDescription }: ResumeMatchPreviewProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // Cache to avoid redundant API calls
  const cacheRef = useRef<Map<string, MatchResult>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check minimum content requirements
  const hasEnoughContent = resume.length >= 100 && jobDescription.length >= 50;

  const analyzeMatch = useCallback(async () => {
    if (!hasEnoughContent || !session?.access_token) {
      return;
    }

    // Check cache first
    const cacheKey = hashInputs(resume, jobDescription);
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResult(cached);
      setError(null);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quick-match-score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ resume, jobDescription }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 429 || data.rateLimited) {
          setIsRateLimited(true);
          setError("Rate limit reached. Try again later.");
          return;
        }
        throw new Error(data.error || "Failed to analyze");
      }

      const data: MatchResult = await response.json();
      
      // Cache the result
      cacheRef.current.set(cacheKey, data);
      setResult(data);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore aborted requests
      }
      console.error("Match analysis error:", err);
      setError("Unable to analyze match score");
    } finally {
      setIsLoading(false);
    }
  }, [resume, jobDescription, hasEnoughContent, session?.access_token]);

  // Debounced analysis
  useEffect(() => {
    if (!hasEnoughContent) {
      setResult(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(analyzeMatch, 500);
    return () => clearTimeout(timeoutId);
  }, [analyzeMatch, hasEnoughContent]);

  // Don't render if not enough content
  if (!hasEnoughContent) {
    return null;
  }

  // Loading state
  if (isLoading && !result) {
    return (
      <Card className="border-border/50 bg-gradient-card mt-4">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rate limited state
  if (isRateLimited) {
    return (
      <Card className="border-warning/50 bg-warning/5 mt-4">
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              Free preview limit reached (10/hour). Click optimize to get your full ATS score!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (non-rate-limit)
  if (error && !result) {
    return null; // Silently fail - this is a preview feature
  }

  // Result state
  if (result) {
    const getAssessmentText = (assessment: string, score: number) => {
      switch (assessment) {
        case "Poor":
          return "Your resume needs significant improvements to match this role.";
        case "Fair":
          return "Your resume has some alignment, but could be stronger.";
        case "Good":
          return "Your resume matches well with this job description!";
        case "Excellent":
          return "Excellent match! Your resume aligns strongly with this role.";
        default:
          return score >= 60 ? "Good alignment with the job description." : "Consider optimizing for better results.";
      }
    };

    return (
      <Card className="border-primary/30 bg-gradient-card mt-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <CardContent className="py-4 relative">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ATSScoreCard 
                score={result.score} 
                label="Match Preview" 
                size="sm" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Resume Match Preview
                </span>
                {isLoading && (
                  <span className="text-xs text-muted-foreground">(updating...)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {getAssessmentText(result.assessment, result.score)}
              </p>
              {result.topMissingKeywords.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Missing keywords: </span>
                  {result.topMissingKeywords.join(", ")}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-3 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Optimize to improve your score!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
