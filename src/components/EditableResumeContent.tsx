import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Pencil, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface EditableResumeContentProps {
  content: string;
  originalContent?: string;
  onContentChange: (newContent: string) => void;
  isEditable: boolean;
}

export function EditableResumeContent({
  content,
  originalContent,
  onContentChange,
  isEditable,
}: EditableResumeContentProps) {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const hasChanges = originalContent && content !== originalContent;

  const handleReset = () => {
    if (originalContent) {
      onContentChange(originalContent);
    }
  };

  if (!isEditable) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 rounded-md px-3",
              mode === "preview" && "bg-background shadow-sm"
            )}
            onClick={() => setMode("preview")}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 rounded-md px-3",
              mode === "edit" && "bg-background shadow-sm"
            )}
            onClick={() => setMode("edit")}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {content.length.toLocaleString()} characters
            {hasChanges && (
              <span className="ml-2 text-primary">• Modified</span>
            )}
          </span>
        </div>
      </div>

      {/* Content Area */}
      {mode === "preview" ? (
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Edit the markdown content below. Changes will be reflected in the PDF download.
          </p>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="min-h-[500px] font-mono text-sm leading-relaxed resize-y"
            placeholder="Resume content..."
          />
        </div>
      )}
    </div>
  );
}
