import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, FileText, Briefcase, Award } from "lucide-react";
import { cn } from "@/lib/utils";

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
    description: "Traditional, ATS-optimized format perfect for corporate roles",
    icon: FileText,
    preview: "Clean lines, clear sections, professional fonts",
  },
  {
    id: "modern",
    name: "Modern Clean",
    description: "Contemporary design with subtle accent colors",
    icon: Briefcase,
    preview: "Modern typography, subtle colors, balanced layout",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium feel for senior and leadership positions",
    icon: Award,
    preview: "Distinguished style, emphasis on achievements",
  },
];

export function TemplateSelector({ open, onOpenChange, onSelect, isDownloading }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Choose Your Template</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 mt-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedTemplate === template.id
                  ? "ring-2 ring-primary border-primary"
                  : "border-border/50"
              )}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn(
                  "p-3 rounded-lg",
                  selectedTemplate === template.id ? "bg-primary/10" : "bg-secondary"
                )}>
                  <template.icon className={cn(
                    "h-6 w-6",
                    selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium flex items-center gap-2">
                    {template.name}
                    {selectedTemplate === template.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
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
