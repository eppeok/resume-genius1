import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserTable } from "@/components/admin/UserTable";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  credits: number;
  created_at: string;
  resume_count: number;
  is_admin: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch resume counts per user
      const { data: resumeCounts } = await supabase
        .from("resumes")
        .select("user_id");

      const resumeCountMap = new Map<string, number>();
      resumeCounts?.forEach((r) => {
        resumeCountMap.set(r.user_id, (resumeCountMap.get(r.user_id) || 0) + 1);
      });

      // Fetch admin users
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminUserIds = new Set(adminRoles?.map((r) => r.user_id) || []);

      // Combine data
      const usersWithData: User[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        credits: profile.credits,
        created_at: profile.created_at,
        resume_count: resumeCountMap.get(profile.id) || 0,
        is_admin: adminUserIds.has(profile.id),
      }));

      setUsers(usersWithData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="User Management | EvolvXTalent Admin"
        description="Manage users on EvolvXTalent"
        noIndex={true}
      />
      <Navigation />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all registered users
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <UserTable users={users} onRefresh={fetchUsers} />
          )}
        </main>
      </div>
    </div>
  );
}
