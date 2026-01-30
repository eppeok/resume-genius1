import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, CreditCard, Loader2, Search, MapPin, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { searchJobs, type JobResult } from "@/lib/api/jobs";
import { JobResultsList } from "@/components/JobResultsList";

interface JobSearchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRole: string;
  location: string;
  resumeId?: string;
  onCreditsUpdated?: () => void;
}

export function JobSearchPopup({
  open,
  onOpenChange,
  targetRole: initialRole,
  location: initialLocation,
  resumeId,
  onCreditsUpdated,
}: JobSearchPopupProps) {
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();
  const [targetRole, setTargetRole] = useState(initialRole);
  const [location, setLocation] = useState(initialLocation);
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sourcesSearched, setSourcesSearched] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!targetRole.trim() || !location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both a target role and location",
        variant: "destructive",
      });
      return;
    }

    if (!profile || profile.credits < 2) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 2 credits to search for jobs",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setJobs([]);
    setHasSearched(false);

    try {
      const result = await searchJobs({
        targetRole: targetRole.trim(),
        location: location.trim(),
        resumeId,
      });

      setJobs(result.jobs);
      setSourcesSearched(result.sourcesSearched);
      setHasSearched(true);
      
      await refreshProfile();
      onCreditsUpdated?.();

      if (result.jobs.length === 0) {
        toast({
          title: "No Jobs Found",
          description: "Try adjusting your search criteria",
        });
      } else {
        toast({
          title: "Jobs Found!",
          description: `Found ${result.jobs.length} relevant job openings`,
        });
      }
    } catch (error) {
      console.error("Job search error:", error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search for jobs",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing if no search was done
    if (!hasSearched) {
      setTargetRole(initialRole);
      setLocation(initialLocation);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${hasSearched && jobs.length > 0 ? "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" : "sm:max-w-lg"}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Find Relevant Job Openings
          </DialogTitle>
          <DialogDescription>
            {hasSearched && jobs.length > 0 
              ? `Found ${jobs.length} jobs matching your profile`
              : "Search for jobs matching your optimized resume profile"
            }
          </DialogDescription>
        </DialogHeader>

        {!hasSearched || jobs.length === 0 ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  This search costs <strong>2 credits</strong>. You have <strong>{profile?.credits ?? 0} credits</strong>.
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRole" className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  Target Role
                </Label>
                <Input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Bangalore, India"
                  maxLength={200}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 inline mr-1" />
                We'll search LinkedIn, Indeed, Naukri, and other job boards based on your location.
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose} disabled={isSearching}>
                Maybe Later
              </Button>
              <Button onClick={handleSearch} disabled={isSearching || !profile || profile.credits < 2}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Jobs (2 Credits)
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <JobResultsList 
              jobs={jobs} 
              isLoading={isSearching}
              sourcesSearched={sourcesSearched}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
