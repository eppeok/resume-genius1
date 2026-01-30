import { useState, useEffect } from "react";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, Briefcase } from "lucide-react";
import type { JobResult } from "@/lib/api/jobs";
import { getBookmarkedUrls } from "@/lib/api/bookmarks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobResultsListProps {
  jobs: JobResult[];
  isLoading?: boolean;
  sourcesSearched?: string[];
}

type SortOption = "relevance" | "date" | "salary";

export function JobResultsList({ jobs, isLoading, sourcesSearched }: JobResultsListProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [bookmarkedUrls, setBookmarkedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadBookmarks = async () => {
      const urls = await getBookmarkedUrls();
      setBookmarkedUrls(urls);
    };
    loadBookmarks();
  }, []);

  const handleBookmarkChange = (applyUrl: string, isBookmarked: boolean) => {
    setBookmarkedUrls((prev) => {
      const next = new Set(prev);
      if (isBookmarked) {
        next.add(applyUrl);
      } else {
        next.delete(applyUrl);
      }
      return next;
    });
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        job.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
        job.location.toLowerCase().includes(searchFilter.toLowerCase());
      
      const matchesSource = sourceFilter === "all" || job.source.toLowerCase().includes(sourceFilter.toLowerCase());
      
      return matchesSearch && matchesSource;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "relevance":
          return b.matchScore - a.matchScore;
        case "date":
          // Simple heuristic: "X days ago" < "X weeks ago" < "X months ago"
          const getDateWeight = (date: string) => {
            if (date.includes("hour") || date.includes("minute")) return 0;
            if (date.includes("day")) return 1;
            if (date.includes("week")) return 2;
            if (date.includes("month")) return 3;
            return 4;
          };
          return getDateWeight(a.postedDate) - getDateWeight(b.postedDate);
        case "salary":
          // Extract numeric value from salary string for rough sorting
          const getSalaryValue = (salary: string | null) => {
            if (!salary) return 0;
            const numbers = salary.match(/\d+/g);
            return numbers ? parseInt(numbers[0]) : 0;
          };
          return getSalaryValue(b.salary) - getSalaryValue(a.salary);
        default:
          return 0;
      }
    });

  const uniqueSources = [...new Set(jobs.map((job) => job.source))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search criteria or location to find more relevant job openings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by title, company, or location..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-36">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Date Posted</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map((source) => (
                <SelectItem key={source} value={source.toLowerCase()}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sources searched */}
      {sourcesSearched && sourcesSearched.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Searched from:</span>
          {sourcesSearched.map((source) => (
            <Badge key={source} variant="outline" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4">
        {filteredJobs.map((job, index) => (
          <JobCard 
            key={`${job.applyUrl}-${index}`} 
            job={job} 
            isBookmarked={bookmarkedUrls.has(job.applyUrl)}
            onBookmarkChange={handleBookmarkChange}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && jobs.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No jobs match your filter criteria.</p>
          <Button variant="link" onClick={() => { setSearchFilter(""); setSourceFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
