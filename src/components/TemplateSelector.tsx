import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Eye, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/pdf/templates/ClassicTemplate";
import { ModernTemplate } from "@/pdf/templates/ModernTemplate";
import { ExecutiveTemplate } from "@/pdf/templates/ExecutiveTemplate";

import templateClassic from "@/assets/template-classic.png";
import templateModern from "@/assets/template-modern.png";
import templateExecutive from "@/assets/template-executive.png";

interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
}

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: string) => void;
  isDownloading: boolean;
  resumeContent?: string;
  fullName?: string;
  targetRole?: string;
  contactInfo?: ContactInfo;
}

const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    description: "Traditional ATS-optimized format with clean sections and navy accents",
    image: templateClassic,
    Component: ClassicTemplate,
  },
  {
    id: "modern",
    name: "Modern Clean",
    description: "Two-column layout with sidebar, skill bars, and contemporary design",
    image: templateModern,
    Component: ModernTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium dark header with gold accents for senior leadership roles",
    image: templateExecutive,
    Component: ExecutiveTemplate,
  },
];

export function TemplateSelector({ 
  open, 
  onOpenChange, 
  onSelect, 
  isDownloading,
  resumeContent = "",
  fullName = "",
  targetRole = "",
  contactInfo
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Cleanup preview URL when dialog closes
  useEffect(() => {
    if (!open) {
      setShowPreview(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [open, previewUrl]);

  const handlePreview = async () => {
    if (!resumeContent) {
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) return;

      const doc = <template.Component content={resumeContent} fullName={fullName} targetRole={targetRole} contactInfo={contactInfo} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Cleanup old URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleBack = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (showPreview && previewUrl) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-display">
                Preview: {templates.find(t => t.id === selectedTemplate)?.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBack}>
                  Back to Templates
                </Button>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => {
                    onSelect(selectedTemplate);
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 bg-muted/30 overflow-hidden">
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Choose Your Template</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Select a professional design for your optimized resume
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg group",
                selectedTemplate === template.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border/50 hover:border-primary/50"
              )}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Selection indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              
              {/* Template preview image */}
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <img
                  src={template.image}
                  alt={`${template.name} template preview`}
                  className="w-full h-full object-cover object-top transition-transform group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              {/* Template info */}
              <div className="p-3 bg-card">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-3 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handlePreview}
            disabled={!resumeContent || isGeneratingPreview}
          >
            {isGeneratingPreview ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Preview PDF
              </>
            )}
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="hero" 
              onClick={() => {
                console.log("Template selected:", selectedTemplate);
                onSelect(selectedTemplate);
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
