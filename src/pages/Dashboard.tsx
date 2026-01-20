import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralCard } from "@/components/ReferralCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, FileText, TrendingUp, Trash2, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Resume {
  id: string;
  target_role: string;
  ats_score_before: number | null;
  ats_score_after: number | null;
  created_at: string;
  template_used: string;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("id, target_role, ats_score_before, ats_score_after, created_at, template_used")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
    } else {
      setResumes(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      });
    } else {
      setResumes(resumes.filter((r) => r.id !== id));
      toast({
        title: "Deleted",
        description: "Resume removed from history",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container max-w-6xl py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">
              Welcome, {profile?.full_name || "there"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              You have {profile?.credits ?? 0} credits remaining
            </p>
          </div>
          <Link to="/optimize">
            <Button variant="hero" size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              New Optimization
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <ReferralCard referralCode={profile?.referral_code ?? null} />
          <Card className="border-border/50 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Optimizations
              </CardTitle>
              <CardDescription>Your resume optimization history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No optimizations yet</p>
                  <Link to="/optimize">
                    <Button variant="outline">Create Your First Resume</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{resume.target_role}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(resume.created_at), "MMM d, yyyy")}
                            </span>
                            {resume.ats_score_before && resume.ats_score_after && (
                              <span className="flex items-center gap-1 text-success">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {resume.ats_score_before}% → {resume.ats_score_after}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/resume/${resume.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(resume.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
