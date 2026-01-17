import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Download, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface ResumeOutputProps {
  content: string;
  isStreaming: boolean;
  onReset: () => void;
}

export function ResumeOutput({ content, isStreaming, onReset }: ResumeOutputProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Resume copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-resume.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Resume saved as optimized-resume.md",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-elevated bg-gradient-card overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-secondary/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <FileCheck className="h-5 w-5 text-success" />
              {isStreaming ? "Generating..." : "Your Optimized Resume"}
            </CardTitle>
            {!isStreaming && content && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground">
            <ReactMarkdown>{content || "Generating your optimized resume..."}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
            )}
          </div>
        </CardContent>
      </Card>

      {!isStreaming && content && (
        <Button variant="secondary" size="lg" onClick={onReset} className="w-full">
          <RefreshCw className="h-4 w-4" />
          Optimize Another Resume
        </Button>
      )}
    </div>
  );
}
