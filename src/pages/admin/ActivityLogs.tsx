import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface ResumeLog {
  id: string;
  user_email: string;
  target_role: string;
  ats_score_before: number | null;
  ats_score_after: number | null;
  created_at: string;
}

interface TransactionLog {
  id: string;
  user_email: string;
  amount: number;
  price_paid: number;
  stripe_session_id: string | null;
  created_at: string;
}

interface ReferralLog {
  id: string;
  referrer_email: string;
  referred_email: string | null;
  status: string;
  credits_awarded: boolean;
  created_at: string;
}

export default function ActivityLogs() {
  const [isLoading, setIsLoading] = useState(true);
  const [resumeLogs, setResumeLogs] = useState<ResumeLog[]>([]);
  const [transactionLogs, setTransactionLogs] = useState<TransactionLog[]>([]);
  const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      // Fetch resume logs
      const { data: resumes } = await supabase
        .from("resumes")
        .select("id, target_role, ats_score_before, ats_score_after, created_at, user_id, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(50);

      setResumeLogs(
        (resumes || []).map((r) => ({
          id: r.id,
          user_email: (r.profiles as { email: string } | null)?.email || "Unknown",
          target_role: r.target_role,
          ats_score_before: r.ats_score_before,
          ats_score_after: r.ats_score_after,
          created_at: r.created_at,
        }))
      );

      // Fetch transaction logs
      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("id, amount, price_paid, stripe_session_id, created_at, user_id, profiles(email)")
        .order("created_at", { ascending: false })
        .limit(50);

      setTransactionLogs(
        (transactions || []).map((t) => ({
          id: t.id,
          user_email: (t.profiles as { email: string } | null)?.email || "Unknown",
          amount: t.amount,
          price_paid: t.price_paid,
          stripe_session_id: t.stripe_session_id,
          created_at: t.created_at,
        }))
      );

      // Fetch referral logs
      const { data: referrals } = await supabase
        .from("referrals")
        .select("id, referrer_id, referred_id, status, credits_awarded, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      // Fetch emails for referrers and referred users
      const userIds = new Set<string>();
      referrals?.forEach((r) => {
        if (r.referrer_id) userIds.add(r.referrer_id);
        if (r.referred_id) userIds.add(r.referred_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", Array.from(userIds));

      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || []);

      setReferralLogs(
        (referrals || []).map((r) => ({
          id: r.id,
          referrer_email: emailMap.get(r.referrer_id) || "Unknown",
          referred_email: r.referred_id ? emailMap.get(r.referred_id) || null : null,
          status: r.status,
          credits_awarded: r.credits_awarded || false,
          created_at: r.created_at || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setIsLoading(false);
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
        title="Activity Logs | EvolvXTalent Admin"
        description="View platform activity logs"
        noIndex={true}
      />
      <Navigation />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground">
              View detailed activity across the platform
            </p>
          </div>

          <Tabs defaultValue="resumes" className="w-full">
            <TabsList>
              <TabsTrigger value="resumes">Resume Optimizations</TabsTrigger>
              <TabsTrigger value="transactions">Credit Transactions</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>

            <TabsContent value="resumes" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Target Role</TableHead>
                      <TableHead className="text-center">Score Before</TableHead>
                      <TableHead className="text-center">Score After</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumeLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No resume optimizations yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      resumeLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{log.user_email}</TableCell>
                          <TableCell>{log.target_role}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{log.ats_score_before ?? "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{log.ats_score_after ?? "—"}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Amount Paid</TableHead>
                      <TableHead>Stripe Session</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No transactions yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{log.user_email}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default">+{log.amount}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            ${(log.price_paid / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.stripe_session_id
                              ? `${log.stripe_session_id.slice(0, 20)}...`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="referrals" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred User</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Credits Awarded</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No referrals yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      referralLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">{log.referrer_email}</TableCell>
                          <TableCell className="text-sm">
                            {log.referred_email || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={log.status === "completed" ? "default" : "secondary"}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {log.credits_awarded ? (
                              <Badge variant="default">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.created_at
                              ? format(new Date(log.created_at), "MMM d, yyyy h:mm a")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
