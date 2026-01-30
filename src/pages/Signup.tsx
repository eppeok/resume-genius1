import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, Users, AlertCircle, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import { validatePassword, getPasswordStrength } from "@/lib/validation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  const { signUp } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // SECURITY: Validate password before submission
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
      await signUp(email, password, fullName, referralCode || undefined);
      toast({
        title: "Account created!",
        description: referralCode
          ? "You've received 3 free credits. Complete your first optimization to unlock referral bonus!"
          : "You've received 3 free credits to get started.",
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <SEO 
        title="Create Account"
        description="Sign up for EvolvXTalent and get 3 free credits to optimize your resume with AI-powered ATS optimization."
        canonical="/signup"
      />
      <Card className="w-full max-w-md border-border/50 shadow-elevated">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center mb-4">
            <img src={logo} alt="EvolvXTalent" className="h-10 w-auto" />
          </Link>
          <CardTitle className="text-2xl font-display">Create Account</CardTitle>
          <CardDescription>Start optimizing your resume today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
            <Gift className="h-5 w-5 text-success" />
            <span className="text-sm text-success font-medium">
              Get 3 free credits when you sign up!
            </span>
          </div>
          
          {referralCode && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">
                Referral code applied! You'll both earn 2 bonus credits after your first optimization.
              </span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
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
            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
