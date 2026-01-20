import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh profile to get updated credits
    refreshProfile();
    
    // Fire confetti celebration
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Payment Successful - EvolvX" 
        description="Your payment was successful. Credits have been added to your account."
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-primary/10 rounded-full p-4">
                    <CheckCircle className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Payment Successful!
                </h1>
                <p className="text-muted-foreground">
                  Thank you for your purchase. Your credits have been added to your account.
                </p>
              </div>

              {/* Credits Display */}
              <div className="bg-primary/10 rounded-lg p-4 inline-flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold text-foreground">
                  Current Balance: {profile?.credits ?? 0} Credits
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={() => navigate("/optimize")} 
                  className="w-full"
                  size="lg"
                >
                  Start Optimizing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>

              {/* Auto-redirect notice */}
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard in {countdown} seconds...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
