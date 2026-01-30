import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Target, FileText, Sparkles, Upload, Loader2, CheckCircle, Mail, Phone, MapPin, Linkedin } from "lucide-react";
import { parseResumeFile, getSupportedFileTypes } from "@/lib/parseResume";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeMatchPreview } from "@/components/ResumeMatchPreview";

interface ResumeFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  currentRole: string;
  targetRole: string;
  currentResume: string;
  jobDescription: string;
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    currentRole: "",
    targetRole: "",
    currentResume: "",
    jobDescription: "",
  });
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Auto-fill from profile on mount
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || profile.full_name || "",
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || "",
        location: prev.location || profile.location || "",
        linkedinUrl: prev.linkedinUrl || profile.linkedin_url || "",
      }));
    }
  }, [profile]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "currentResume") {
      setUploadedFileName(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setUploadedFileName(null);

    try {
      const text = await parseResumeFile(file);
      handleChange("currentResume", text);
      setUploadedFileName(file.name);
      toast({
        title: "File uploaded",
        description: `Successfully extracted text from ${file.name}`,
      });
    } catch (error) {
      console.error("File parsing error:", error);
      toast({
        title: "Error parsing file",
        description: error instanceof Error ? error.message : "Failed to read file",
        variant: "destructive",
      });
    } finally {
      setIsParsingFile(false);
      // Reset input so same file can be selected again
      e.target.value = "";
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
                maxLength={100}
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
                maxLength={100}
              />
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-background"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-background"
                maxLength={30}
              />
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="bg-background"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />
                LinkedIn Profile
              </Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="linkedin.com/in/yourprofile"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                className="bg-background"
                maxLength={200}
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
          <CardDescription>Upload a file or paste your resume text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label
              htmlFor="resumeFile"
              className={`flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer transition-colors ${
                isParsingFile 
                  ? "border-primary bg-primary/5" 
                  : uploadedFileName
                  ? "border-success bg-success/5"
                  : "border-border hover:bg-secondary/50"
              }`}
            >
              {isParsingFile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-primary">Parsing file...</span>
                </>
              ) : uploadedFileName ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">{uploadedFileName}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload PDF, DOCX, or TXT
                  </span>
                </>
              )}
            </Label>
            <input
              id="resumeFile"
              type="file"
              accept={getSupportedFileTypes()}
              onChange={handleFileUpload}
              className="hidden"
              disabled={isParsingFile}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentResume">Resume Content *</Label>
            <Textarea
              id="currentResume"
              placeholder="Paste your current resume here or upload a file above..."
              value={formData.currentResume}
              onChange={(e) => handleChange("currentResume", e.target.value)}
              className="min-h-[200px] bg-background resize-y font-mono text-sm"
            />
          </div>
          
          {/* Resume Match Preview */}
          <ResumeMatchPreview 
            resume={formData.currentResume} 
            jobDescription={formData.jobDescription} 
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="hero"
        size="xl"
        disabled={!isFormValid || isLoading || isParsingFile}
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
