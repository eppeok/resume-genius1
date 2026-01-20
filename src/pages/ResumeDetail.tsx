import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ATSScoreCard } from "@/components/ATSScoreCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { EditableResumeContent } from "@/components/EditableResumeContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Briefcase, Loader2, FileCheck, Copy, Download, Save } from "lucide-react";
import { format } from "date-fns";

interface ResumeData {
  id: string;
  target_role: string;
  job_description: string;
  original_resume: string;
  optimized_resume: string | null;
  template_used: string | null;
  full_name: string | null;
  user_current_role: string | null;
  ats_score_before: number | null;
  ats_score_after: number | null;
  keyword_match_before: number | null;
  keyword_match_after: number | null;
  formatting_score_before: number | null;
  formatting_score_after: number | null;
  section_score_before: number | null;
  section_score_after: number | null;
  readability_before: number | null;
  readability_after: number | null;
  created_at: string;
}

export default function ResumeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResume(id);
    }
  }, [id]);

  const fetchResume = async (resumeId: string) => {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .single();

    if (error) {
      console.error("Error fetching resume:", error);
      navigate("/dashboard");
    } else {
      setResume(data);
      setEditedContent(data.optimized_resume || "");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!resume || !id) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("resumes")
      .update({ optimized_resume: editedContent })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } else {
      setResume({ ...resume, optimized_resume: editedContent });
      toast({
        title: "Saved!",
        description: "Your changes have been saved",
      });
    }
    setIsSaving(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent);
    toast({
      title: "Copied!",
      description: "Resume copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([editedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume?.full_name || "resume"}-optimized.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Resume saved as markdown file",
    });
  };

  const hasChanges = resume?.optimized_resume !== editedContent;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SEO
        title={`Resume - ${resume.target_role}`}
        description="View your optimized resume details"
        noIndex={true}
      />
      <Navigation />

      <div className="container max-w-6xl py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            {resume.target_role}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(resume.created_at), "MMM d, yyyy")}
            </div>
            {resume.user_current_role && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {resume.user_current_role}
              </div>
            )}
          </div>
        </div>

        {/* ATS Score Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/50 shadow-soft p-6">
            <ATSScoreCard
              score={resume.ats_score_before ?? 0}
              label="Original Score"
              variant="before"
            />
          </Card>
          <Card className="border-border/50 shadow-soft p-6">
            <ATSScoreCard
              score={resume.ats_score_after ?? 0}
              label="Optimized Score"
              variant="after"
            />
          </Card>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border/50 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Before Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown
                keywordMatch={resume.keyword_match_before ?? 0}
                formatting={resume.formatting_score_before ?? 0}
                sections={resume.section_score_before ?? 0}
                readability={resume.readability_before ?? 0}
                variant="before"
              />
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">After Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown
                keywordMatch={resume.keyword_match_after ?? 0}
                formatting={resume.formatting_score_after ?? 0}
                sections={resume.section_score_after ?? 0}
                readability={resume.readability_after ?? 0}
                variant="after"
              />
            </CardContent>
          </Card>
        </div>

        {/* Optimized Resume */}
        {resume.optimized_resume && (
          <Card className="border-border/50 shadow-elevated overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-secondary/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg font-display">
                  <FileCheck className="h-5 w-5 text-success" />
                  Your Optimized Resume
                </CardTitle>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <EditableResumeContent
                content={editedContent}
                originalContent={resume.optimized_resume}
                onContentChange={setEditedContent}
                isEditable={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
