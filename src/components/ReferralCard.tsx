import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Twitter, Linkedin, MessageCircle } from "lucide-react";
import { Users, Copy, Gift, Check, Loader2 } from "lucide-react";

const shareMessage = "I've been using EvolvXTalent to optimize my resume and it's amazing! Use my referral link to get 3 free credits + earn 2 bonus credits after your first optimization:";

interface ReferralStats {
  pending: number;
  completed: number;
  creditsEarned: number;
}

interface ReferralCardProps {
  referralCode: string | null;
}

export function ReferralCard({ referralCode }: ReferralCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({ pending: 0, completed: 0, creditsEarned: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const referralLink = referralCode 
    ? `${window.location.origin}/signup?ref=${referralCode}` 
    : "";

  useEffect(() => {
    if (referralCode) {
      fetchReferralStats();
    }
  }, [referralCode]);

  const fetchReferralStats = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: referrals, error } = await supabase
        .from("referrals")
        .select("status, credits_awarded")
        .eq("referrer_id", user.id);

      if (error) {
        console.error("Error fetching referrals:", error);
        return;
      }

      const pending = referrals?.filter(r => r.status === "pending").length || 0;
      const completed = referrals?.filter(r => r.status === "completed").length || 0;
      const creditsEarned = completed * 2; // 2 credits per completed referral

      setStats({ pending, completed, creditsEarned });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`${shareMessage} ${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(referralLink);
    const title = encodeURIComponent("Get free resume optimization credits!");
    const summary = encodeURIComponent(shareMessage);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareMessage} ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  if (!referralCode) {
    return null;
  }

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Refer a Friend
        </CardTitle>
        <CardDescription>
          Invite friends and both of you earn 2 credits when they complete their first optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Your Referral Link</label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your code: <span className="font-mono font-medium">{referralCode}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Share via</label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareTwitter}
              className="flex-1 gap-2"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLinkedIn}
              className="flex-1 gap-2"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="flex-1 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-success/10">
                <div className="text-2xl font-bold text-success">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <Gift className="h-4 w-4" />
                  {stats.creditsEarned}
                </div>
                <div className="text-xs text-muted-foreground">Credits Earned</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
