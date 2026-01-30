import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <SEO 
        title="Forgot Password"
        description="Reset your EvolvXTalent account password."
        canonical="/forgot-password"
      />
      <Card className="w-full max-w-md border-border/50 shadow-elevated">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center mb-4">
            <img src={logo} alt="EvolvXTalent" className="h-10 w-auto" />
          </Link>
          <CardTitle className="text-2xl font-display">Reset Password</CardTitle>
          <CardDescription>
            {isSubmitted 
              ? "Check your email for the reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and click the link to reset your password.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSubmitted(false)}
              >
                Send another link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
          <Link 
            to="/login" 
            className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
