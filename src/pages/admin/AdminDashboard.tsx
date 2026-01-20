import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatsCards } from "@/components/admin/StatsCards";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface RecentActivity {
  id: string;
  type: "resume" | "signup" | "purchase";
  description: string;
  date: string;
  metadata?: Record<string, string | number>;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    totalCreditsSpent: 0,
    activeUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total resumes
      const { count: resumeCount } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true });

      // Fetch total credits purchased
      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("amount");
      const totalCredits = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch active users (users with resumes in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: activeResumes } = await supabase
        .from("resumes")
        .select("user_id")
        .gte("created_at", sevenDaysAgo.toISOString());
      const activeUserIds = new Set(activeResumes?.map((r) => r.user_id) || []);

      setStats({
        totalUsers: userCount || 0,
        totalResumes: resumeCount || 0,
        totalCreditsSpent: totalCredits,
        activeUsers: activeUserIds.size,
      });

      // Fetch recent activity
      const activities: RecentActivity[] = [];

      // Recent resumes
      const { data: recentResumes } = await supabase
        .from("resumes")
        .select("id, target_role, created_at, user_id, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(5);

      recentResumes?.forEach((resume) => {
        activities.push({
          id: `resume-${resume.id}`,
          type: "resume",
          description: `Resume optimized for ${resume.target_role}`,
          date: resume.created_at,
          metadata: { email: (resume.profiles as { email: string } | null)?.email || "Unknown" },
        });
      });

      // Recent signups
      const { data: recentUsers } = await supabase
        .from("profiles")
        .select("id, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      recentUsers?.forEach((user) => {
        activities.push({
          id: `signup-${user.id}`,
          type: "signup",
          description: `New user: ${user.email}`,
          date: user.created_at,
        });
      });

      // Recent purchases
      const { data: recentPurchases } = await supabase
        .from("credit_transactions")
        .select("id, amount, created_at, user_id, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(5);

      recentPurchases?.forEach((purchase) => {
        activities.push({
          id: `purchase-${purchase.id}`,
          type: "purchase",
          description: `${purchase.amount} credits purchased`,
          date: purchase.created_at,
          metadata: { email: (purchase.profiles as { email: string } | null)?.email || "Unknown" },
        });
      });

      // Sort by date and take top 10
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityBadge = (type: RecentActivity["type"]) => {
    switch (type) {
      case "resume":
        return <Badge variant="secondary">Resume</Badge>;
      case "signup":
        return <Badge variant="default">Signup</Badge>;
      case "purchase":
        return <Badge variant="outline" className="border-primary text-primary">Purchase</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin Dashboard | EvolvXTalent"
        description="Admin dashboard for EvolvXTalent"
        noIndex={true}
      />
      <Navigation />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your platform's performance
            </p>
          </div>

          <StatsCards {...stats} />

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        {getActivityBadge(activity.type)}
                        <div>
                          <p className="text-sm font-medium">{activity.description}</p>
                          {activity.metadata?.email && (
                            <p className="text-xs text-muted-foreground">
                              {activity.metadata.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(activity.date), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
