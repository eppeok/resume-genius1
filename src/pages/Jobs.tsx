import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { JobResultsList } from "@/components/JobResultsList";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  searchJobs, 
  getJobSearchHistory, 
  deleteJobSearch,
  type JobResult, 
  type JobSearchHistory 
} from "@/lib/api/jobs";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  CreditCard, 
  Loader2, 
  History, 
  Trash2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Jobs() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [sourcesSearched, setSourcesSearched] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [searchHistory, setSearchHistory] = useState<JobSearchHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<JobSearchHistory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSearchHistory();
    // Pre-fill location from profile
    if (profile?.location) {
      setLocation(profile.location);
    }
  }, [profile?.location]);

  const loadSearchHistory = async () => {
    try {
      const history = await getJobSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error("Failed to load search history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

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
    setSelectedHistory(null);

    try {
      const result = await searchJobs({
        targetRole: targetRole.trim(),
        location: location.trim(),
      });

      setJobs(result.jobs);
      setSourcesSearched(result.sourcesSearched);
      setHasSearched(true);
      
      await refreshProfile();
      await loadSearchHistory();

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

  const handleHistoryClick = (history: JobSearchHistory) => {
    setSelectedHistory(history);
    setJobs(history.job_results);
    setSourcesSearched(history.sources_searched || []);
    setHasSearched(true);
    setTargetRole(history.search_query);
    setLocation(history.location || "");
  };

  const handleDeleteHistory = async () => {
    if (!deletingId) return;

    try {
      await deleteJobSearch(deletingId);
      setSearchHistory((prev) => prev.filter((h) => h.id !== deletingId));
      if (selectedHistory?.id === deletingId) {
        setSelectedHistory(null);
        setJobs([]);
        setHasSearched(false);
      }
      toast({
        title: "Deleted",
        description: "Job search history deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete search history",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SEO 
        title="Find Jobs"
        description="Find relevant job openings based on your resume profile. AI-powered job matching from LinkedIn, Indeed, Naukri and more."
        noIndex={true}
      />
      <Navigation />

      <div className="container max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center justify-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Find Your Next Opportunity
          </h1>
          <p className="text-muted-foreground">
            Search for jobs matching your profile • You have {profile?.credits ?? 0} credits
          </p>
        </div>

        {/* Low credits warning */}
        {profile && profile.credits < 2 && (
          <Card className="mb-6 border-warning/50 bg-warning/10">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium">Insufficient credits</p>
                <p className="text-sm text-muted-foreground">You need at least 2 credits to search for jobs</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/credits")}>
                Buy Credits
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Form */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  New Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
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

                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm">
                  <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Each search costs <strong>2 credits</strong></span>
                </div>

                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching || !profile || profile.credits < 2}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Jobs
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Search History */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : searchHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No search history yet
                  </p>
                ) : (
                  searchHistory.slice(0, 5).map((history) => (
                    <div
                      key={history.id}
                      className={`group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedHistory?.id === history.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:bg-secondary/50"
                      }`}
                      onClick={() => handleHistoryClick(history)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{history.search_query}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {history.location} • {formatDate(history.created_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {history.job_results.length} jobs found
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(history.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 min-h-[400px]">
              <CardHeader>
                <CardTitle className="text-lg">
                  {hasSearched 
                    ? selectedHistory 
                      ? `Results from ${formatDate(selectedHistory.created_at)}`
                      : "Search Results"
                    : "Job Listings"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSearching ? (
                  <JobResultsList jobs={[]} isLoading={true} />
                ) : hasSearched ? (
                  <JobResultsList 
                    jobs={jobs} 
                    sourcesSearched={sourcesSearched}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Ready to find your next job?</h3>
                    <p className="text-muted-foreground max-w-md">
                      Enter your target role and location to search for relevant job openings from LinkedIn, Indeed, Naukri, and more.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Search History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this search? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
