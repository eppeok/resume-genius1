import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, Target, FileText, Sparkles, Upload } from "lucide-react";

interface ResumeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  fullName: string;
  currentRole: string;
  targetRole: string;
  currentResume: string;
  jobDescription: string;
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    currentRole: "",
    targetRole: "",
    currentResume: "",
    jobDescription: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/plain") {
      const text = await file.text();
      handleChange("currentResume", text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = 
    formData.fullName.trim() && 
    formData.targetRole.trim() && 
    formData.currentResume.trim() && 
    formData.jobDescription.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info Section */}
      <Card className="border-border/50 shadow-soft bg-gradient-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>Tell us about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentRole">Current Role</Label>
              <Input
                id="currentRole"
                placeholder="Software Engineer"
                value={formData.currentRole}
                onChange={(e) => handleChange("currentRole", e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Job Section */}
      <Card className="border-border/50 shadow-soft bg-gradient-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Target className="h-5 w-5 text-primary" />
            Target Position
          </CardTitle>
          <CardDescription>What role are you applying for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role *</Label>
            <Input
              id="targetRole"
              placeholder="Senior Software Engineer"
              value={formData.targetRole}
              onChange={(e) => handleChange("targetRole", e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              value={formData.jobDescription}
              onChange={(e) => handleChange("jobDescription", e.target.value)}
              className="min-h-[150px] bg-background resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resume Section */}
      <Card className="border-border/50 shadow-soft bg-gradient-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <FileText className="h-5 w-5 text-primary" />
            Your Current Resume
          </CardTitle>
          <CardDescription>Paste your resume or upload a text file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="resumeFile"
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Upload .txt file</span>
            </Label>
            <input
              id="resumeFile"
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentResume">Resume Content *</Label>
            <Textarea
              id="currentResume"
              placeholder="Paste your current resume here..."
              value={formData.currentResume}
              onChange={(e) => handleChange("currentResume", e.target.value)}
              className="min-h-[200px] bg-background resize-y font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="hero"
        size="xl"
        disabled={!isFormValid || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Sparkles className="h-5 w-5 animate-pulse-soft" />
            Optimizing Resume...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate ATS-Optimized Resume
          </>
        )}
      </Button>
    </form>
  );
}
