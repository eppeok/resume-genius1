import { ExternalLink, MapPin, Building2, DollarSign, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JobResult } from "@/lib/api/jobs";

interface JobCardProps {
  job: JobResult;
}

export function JobCard({ job }: JobCardProps) {
  const getMatchColor = (score: number) => {
    if (score >= 80) return "bg-success/10 text-success border-success/30";
    if (score >= 60) return "bg-warning/10 text-warning border-warning/30";
    return "bg-muted text-muted-foreground border-muted";
  };

  const getSourceBadgeVariant = (source: string): "default" | "secondary" | "outline" => {
    const normalizedSource = source.toLowerCase();
    if (normalizedSource.includes("linkedin")) return "default";
    if (normalizedSource.includes("naukri")) return "secondary";
    return "outline";
  };

  const handleApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
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
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{job.company}</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                <Star className="h-3.5 w-3.5" />
                <span>{job.matchScore}%</span>
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
              <span className="text-xs opacity-70">{job.postedDate}</span>
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

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Badge variant={getSourceBadgeVariant(job.source)}>
                {job.source}
              </Badge>
              <Button 
                size="sm" 
                onClick={handleApply}
                disabled={!job.applyUrl}
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
