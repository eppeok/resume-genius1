import { useState } from "react";
import { ExternalLink, MapPin, Building2, DollarSign, Star, Trash2, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { removeBookmark, updateBookmarkNotes } from "@/lib/api/bookmarks";
import type { BookmarkedJob } from "@/lib/api/bookmarks";
import { format } from "date-fns";

interface BookmarkedJobCardProps {
  job: BookmarkedJob;
  onRemove?: (id: string) => void;
}

export function BookmarkedJobCard({ job, onRemove }: BookmarkedJobCardProps) {
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(job.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const getMatchColor = (score: number | null) => {
    if (!score) return "bg-muted text-muted-foreground border-muted";
    if (score >= 80) return "bg-success/10 text-success border-success/30";
    if (score >= 60) return "bg-warning/10 text-warning border-warning/30";
    return "bg-muted text-muted-foreground border-muted";
  };

  const handleApply = () => {
    if (job.apply_url) {
      window.open(job.apply_url, "_blank", "noopener,noreferrer");
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeBookmark(job.apply_url);
      onRemove?.(job.id);
      toast({
        title: "Removed",
        description: "Job removed from bookmarks",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove bookmark",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateBookmarkNotes(job.id, notes);
      toast({
        title: "Saved",
        description: "Notes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <Card className="group hover:shadow-elevated transition-all duration-200 border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {job.job_title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{job.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
                {job.match_score && (
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-sm font-medium ${getMatchColor(job.match_score)}`}>
                    <Star className="h-3.5 w-3.5" />
                    <span>{job.match_score}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{job.salary}</span>
                </div>
              )}
              <span className="text-xs opacity-70">
                Saved {format(new Date(job.created_at), "MMM d, yyyy")}
              </span>
            </div>

            {job.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {job.description}
              </p>
            )}

            {job.highlights && job.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.highlights.slice(0, 3).map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            )}

            {/* Notes Section */}
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="gap-1.5 text-muted-foreground -ml-2"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {job.notes ? "View Notes" : "Add Notes"}
              </Button>
              
              {showNotes && (
                <div className="mt-2 space-y-2">
                  <Textarea
                    placeholder="Add your notes about this job..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                  >
                    {isSavingNotes ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : null}
                    Save Notes
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Badge variant="outline">{job.source}</Badge>
              <Button 
                size="sm" 
                onClick={handleApply}
                disabled={!job.apply_url}
                className="gap-1.5"
              >
                Apply
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
