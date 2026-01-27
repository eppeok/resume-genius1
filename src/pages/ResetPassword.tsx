import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { validatePassword, getPasswordStrength } from "@/lib/validation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = {
    weak: "bg-red-500",
    fair: "bg-yellow-500",
    good: "bg-blue-500",
    strong: "bg-green-500",
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const { errors } = validatePassword(value);
    setPasswordErrors(errors);
  };

  useEffect(() => {
    // Check if we have a valid session from the email link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        navigate("/forgot-password");
      }
    };
    checkSession();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    // SECURITY: Validate password strength
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      setPasswordErrors(errors);
      toast({
        title: "Weak Password",
        description: "Please choose a stronger password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <SEO 
        title="Reset Password"
        description="Set a new password for your EvolvXTalent account."
        canonical="/reset-password"
      />
      <Card className="w-full max-w-md border-border/50 shadow-elevated">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">EvolvXTalent</span>
          </Link>
          <CardTitle className="text-2xl font-display">
            {isSuccess ? "Password Updated!" : "Set New Password"}
          </CardTitle>
          <CardDescription>
            {isSuccess 
              ? "You can now sign in with your new password" 
              : "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  minLength={8}
                  className={passwordErrors.length > 0 ? "border-destructive" : ""}
                />
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strengthColors[passwordStrength.label]}`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium capitalize ${
                        passwordStrength.label === "strong" ? "text-green-600" :
                        passwordStrength.label === "good" ? "text-blue-600" :
                        passwordStrength.label === "fair" ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    {passwordErrors.length > 0 && (
                      <div className="space-y-1">
                        {passwordErrors.map((error, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-destructive" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                    {passwordErrors.length === 0 && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Password meets requirements
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className={confirmPassword && password !== confirmPassword ? "border-destructive" : ""}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
