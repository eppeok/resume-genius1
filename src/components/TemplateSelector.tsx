import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import templateClassic from "@/assets/template-classic.png";
import templateModern from "@/assets/template-modern.png";
import templateExecutive from "@/assets/template-executive.png";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: string) => void;
  isDownloading: boolean;
}

const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    description: "Traditional ATS-optimized format with clean sections and navy accents",
    image: templateClassic,
  },
  {
    id: "modern",
    name: "Modern Clean",
    description: "Two-column layout with sidebar, skill bars, and contemporary design",
    image: templateModern,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium dark header with gold accents for senior leadership roles",
    image: templateExecutive,
  },
];

export function TemplateSelector({ open, onOpenChange, onSelect, isDownloading }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

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

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
            {isDownloading ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
