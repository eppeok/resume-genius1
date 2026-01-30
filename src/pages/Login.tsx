import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLoginRateLimiter } from "@/hooks/useLoginRateLimiter";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, Mail, ShieldAlert } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLocked, getRemainingLockoutTime, getRemainingAttempts, recordFailedAttempt, resetOnSuccess } = useLoginRateLimiter();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox and spam folder.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    setShowVerificationReminder(false);
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (isLocked()) {
      const remainingMinutes = getRemainingLockoutTime();
      toast({
        title: "Too many failed attempts",
        description: `Please wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await signIn(email, password);
      
      // Reset rate limiter on successful login
      resetOnSuccess();
      
      // Check if email is verified
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !user.email_confirmed_at) {
        setUnverifiedEmail(user.email || email);
        setShowVerificationReminder(true);
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate(from, { replace: true });
    } catch (error) {
      // Record failed attempt
      recordFailedAttempt();
      const remaining = getRemainingAttempts();
      
      toast({
        title: "Error",
        description: remaining > 0 
          ? `${error instanceof Error ? error.message : "Failed to sign in"}. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : "Too many failed attempts. Please wait 15 minutes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <SEO 
        title="Sign In"
        description="Sign in to your EvolvXTalent account to optimize your resume and land more interviews."
        canonical="/login"
      />
      <Card className="w-full max-w-md border-border/50 shadow-elevated">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center mb-4">
            <img src={logo} alt="EvolvXTalent" className="h-10 w-auto" />
          </Link>
          <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={isLoading || isLocked()}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : isLocked() ? (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  Locked ({getRemainingLockoutTime()} min)
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          {showVerificationReminder && (
            <Alert className="mt-4 border-warning/50 bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="ml-2">
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    Your email address hasn't been verified yet. Please check your inbox for the verification link.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="flex items-center gap-2"
                    >
                      {isResending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      Resend verification email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleContinue}
                    >
                      Continue anyway
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
