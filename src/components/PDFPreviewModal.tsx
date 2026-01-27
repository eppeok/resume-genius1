import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, X, ZoomIn, ZoomOut } from "lucide-react";
import { generatePDF, downloadPDF, ContactInfo } from "@/pdf/PDFGenerator";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  fullName: string;
  targetRole: string;
  contactInfo?: ContactInfo;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  content,
  fullName,
  targetRole,
  contactInfo,
}: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (isOpen && content) {
      generatePreview();
    }
    
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, content, fullName, targetRole, contactInfo]);

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const blob = await generatePDF({
        content,
        fullName,
        targetRole,
        template: "minimal",
        contactInfo,
      });
      
      // Revoke previous URL if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Preview generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePDF({
        content,
        fullName,
        targetRole,
        template: "minimal",
        contactInfo,
      });
      
      downloadPDF(blob, `${fullName || "resume"}.pdf`);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setZoom(100);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display">PDF Preview</DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleDownload}
                disabled={isDownloading || isLoading}
                className="gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-muted/30 p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating preview...</p>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-destructive">
              <p className="mb-4">{error}</p>
              <Button variant="outline" onClick={generatePreview}>
                Try Again
              </Button>
            </div>
          )}
          
          {pdfUrl && !isLoading && !error && (
            <div className="flex justify-center">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="bg-white shadow-lg rounded-sm"
                style={{
                  width: `${(595 * zoom) / 100}px`,
                  height: `${(842 * zoom) / 100}px`,
                  border: "none",
                }}
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
