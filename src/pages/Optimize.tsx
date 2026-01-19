import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ResumeForm, FormData } from "@/components/ResumeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { TemplateSelector } from "@/components/TemplateSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generatePDF, downloadPDF, TemplateName } from "@/pdf/PDFGenerator";
import ReactMarkdown from "react-markdown";
import { 
  FileCheck, Download, Copy, RefreshCw, 
  Loader2, TrendingUp, Sparkles, AlertCircle 
} from "lucide-react";

interface ATSScores {
  overallScore: number;
  keywordMatch: number;
  formatting: number;
  sections: number;
  readability: number;
  suggestions?: string[];
}

export default function Optimize() {
  const { profile, refreshProfile, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<"form" | "analyzing" | "optimizing" | "result">("form");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [originalScores, setOriginalScores] = useState<ATSScores | null>(null);
  const [optimizedScores, setOptimizedScores] = useState<ATSScores | null>(null);
  const [optimizedResume, setOptimizedResume] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const analyzeResume = async (resume: string, jobDescription: string): Promise<ATSScores> => {
    // Use authenticated request
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-ats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession?.access_token || ""}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ resume, jobDescription }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to analyze resume");
    }

    return response.json();
  };

  const handleSubmit = useCallback(async (data: FormData) => {
    if (!profile || profile.credits < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to optimize a resume.",
        variant: "destructive",
      });
      navigate("/credits");
      return;
    }

    setFormData(data);
    setStep("analyzing");

    try {
      // First analyze the original resume
      const scores = await analyzeResume(data.currentResume, data.jobDescription);
      setOriginalScores(scores);
      
      // Now optimize the resume (credit is deducted server-side)
      setStep("optimizing");
      setIsStreaming(true);
      setOptimizedResume("");

      // Use authenticated request
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentSession?.access_token || ""}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to optimize resume");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              setOptimizedResume(fullContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      setIsStreaming(false);

      // Analyze the optimized resume
      const optimizedScoresResult = await analyzeResume(fullContent, data.jobDescription);
      setOptimizedScores(optimizedScoresResult);

      // Save to database (credit already deducted server-side)
      await supabase.from("resumes").insert({
        user_id: profile.id,
        original_resume: data.currentResume,
        optimized_resume: fullContent,
        job_description: data.jobDescription,
        target_role: data.targetRole,
        full_name: data.fullName,
        user_current_role: data.currentRole,
        ats_score_before: scores.overallScore,
        ats_score_after: optimizedScoresResult.overallScore,
        keyword_match_before: scores.keywordMatch,
        keyword_match_after: optimizedScoresResult.keywordMatch,
        formatting_score_before: scores.formatting,
        formatting_score_after: optimizedScoresResult.formatting,
        section_score_before: scores.sections,
        section_score_after: optimizedScoresResult.sections,
        readability_before: scores.readability,
        readability_after: optimizedScoresResult.readability,
      });

      // Refresh profile to update credits display
      await refreshProfile();

      setStep("result");
      toast({
        title: "Resume Optimized!",
        description: `Your ATS score improved from ${scores.overallScore}% to ${optimizedScoresResult.overallScore}%`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process resume",
        variant: "destructive",
      });
      setStep("form");
      setIsStreaming(false);
      // Refresh profile in case credit was deducted before failure
      await refreshProfile();
    }
  }, [profile, toast, navigate, refreshProfile]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedResume);
    toast({
      title: "Copied!",
      description: "Resume copied to clipboard",
    });
  };

  const handleDownloadPDF = async (template: TemplateName) => {
    setIsDownloading(true);
    try {
      const blob = await generatePDF({
        content: optimizedResume,
        fullName: formData?.fullName || "",
        targetRole: formData?.targetRole || "",
        template,
      });
      downloadPDF(blob, `${formData?.fullName || "resume"}-${template}.pdf`);
      setShowTemplateSelector(false);
      toast({
        title: "Downloaded!",
        description: "Your PDF resume has been downloaded",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setFormData(null);
    setOriginalScores(null);
    setOptimizedScores(null);
    setOptimizedResume("");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container max-w-5xl py-8 px-4">
        {profile && profile.credits < 1 && step === "form" && (
          <Card className="mb-6 border-warning/50 bg-warning/10">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium">You have no credits remaining</p>
                <p className="text-sm text-muted-foreground">Purchase credits to continue optimizing resumes</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/credits")}>
                Buy Credits
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "form" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-display font-bold mb-2">Optimize Your Resume</h1>
              <p className="text-muted-foreground">
                AI-powered ATS optimization • You have {profile?.credits ?? 0} credits
              </p>
            </div>
            <ResumeForm onSubmit={handleSubmit} isLoading={false} />
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-display font-semibold mb-2">Analyzing Your Resume</h2>
            <p className="text-muted-foreground">Calculating your current ATS score...</p>
          </div>
        )}

        {step === "optimizing" && (
          <div className="space-y-8">
            {originalScores && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Original Resume Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-8">
                  <ATSScoreCard score={originalScores.overallScore} label="Current Score" variant="before" />
                  <div className="flex-1">
                    <ScoreBreakdown
                      keywordMatch={originalScores.keywordMatch}
                      formatting={originalScores.formatting}
                      sections={originalScores.sections}
                      readability={originalScores.readability}
                      variant="before"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/50 shadow-elevated">
              <CardHeader className="border-b border-border/50 bg-secondary/30">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  Optimizing Your Resume...
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{optimizedResume || "Generating your optimized resume..."}</ReactMarkdown>
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-8">
            {/* Score Comparison */}
            {originalScores && optimizedScores && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Before Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-6">
                    <ATSScoreCard score={originalScores.overallScore} label="Original Score" variant="before" />
                    <ScoreBreakdown
                      keywordMatch={originalScores.keywordMatch}
                      formatting={originalScores.formatting}
                      sections={originalScores.sections}
                      readability={originalScores.readability}
                      variant="before"
                    />
                  </CardContent>
                </Card>

                <Card className="border-primary/50 ring-2 ring-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      After Optimization
                      <span className="text-sm font-normal text-success">
                        +{optimizedScores.overallScore - originalScores.overallScore}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-6">
                    <ATSScoreCard score={optimizedScores.overallScore} label="Optimized Score" variant="after" />
                    <ScoreBreakdown
                      keywordMatch={optimizedScores.keywordMatch}
                      formatting={optimizedScores.formatting}
                      sections={optimizedScores.sections}
                      readability={optimizedScores.readability}
                      variant="after"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Optimized Resume */}
            <Card className="border-border/50 shadow-elevated overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <FileCheck className="h-5 w-5 text-success" />
                    Your Optimized Resume
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowTemplateSelector(true)}>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground">
                  <ReactMarkdown>{optimizedResume}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Button variant="secondary" size="lg" onClick={handleReset} className="w-full">
              <RefreshCw className="h-4 w-4" />
              Optimize Another Resume
            </Button>
          </div>
        )}

        <TemplateSelector
          open={showTemplateSelector}
          onOpenChange={setShowTemplateSelector}
          onSelect={handleDownloadPDF}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
}
