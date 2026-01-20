import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2, Zap, Star, Crown, Tag, X } from "lucide-react";

const creditPacks = [
  {
    id: "10-credits",
    name: "Starter",
    credits: 10,
    price: 9,
    pricePerCredit: "0.90",
    icon: Zap,
    popular: false,
  },
  {
    id: "25-credits",
    name: "Professional",
    credits: 25,
    price: 19,
    pricePerCredit: "0.76",
    icon: Star,
    popular: true,
  },
  {
    id: "50-credits",
    name: "Enterprise",
    credits: 50,
    price: 29,
    pricePerCredit: "0.58",
    icon: Crown,
    popular: false,
  },
];

interface AppliedCoupon {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

export default function BuyCredits() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Handle fallback success redirect from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      refreshProfile();
      toast({ 
        title: "Payment Successful!", 
        description: "Your credits have been added to your account." 
      });
      // Clear the query params and redirect to success page
      navigate('/payment-success', { replace: true });
    }
  }, [searchParams, refreshProfile, toast, navigate]);

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice;
    
    if (appliedCoupon.discount_type === "percentage") {
      return originalPrice * (1 - appliedCoupon.discount_value / 100);
    } else {
      // Fixed discount is stored in cents
      const discountDollars = appliedCoupon.discount_value / 100;
      return Math.max(0, originalPrice - discountDollars);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Error", description: "Please enter a coupon code", variant: "destructive" });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      // Validate the coupon with minimum pack price (900 cents = $9)
      const { data, error } = await supabase.rpc("validate_coupon", {
        p_code: couponCode.trim(),
        p_user_id: profile?.id,
        p_purchase_amount: 900, // Minimum pack price in cents
      });

      if (error) throw error;

      const result = data?.[0];
      if (!result?.is_valid) {
        toast({
          title: "Invalid Coupon",
          description: result?.error_message || "This coupon cannot be applied",
          variant: "destructive",
        });
        return;
      }

      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discount_type: result.discount_type as "percentage" | "fixed",
        discount_value: result.discount_value,
      });
      setCouponCode("");
      toast({ title: "Coupon Applied!", description: "Discount will be applied at checkout" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to validate coupon",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast({ title: "Coupon removed" });
  };

  const handlePurchase = async (packId: string) => {
    setLoadingPack(packId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("You must be logged in to purchase credits");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ 
            pack_id: packId,
            coupon_code: appliedCoupon?.code || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoadingPack(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <SEO 
        title="Buy Credits"
        description="Purchase credits to optimize more resumes with AI-powered ATS optimization."
        noIndex={true}
      />
      <Navigation />
      
      <div className="container max-w-5xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Buy Credits</h1>
          <p className="text-xl text-muted-foreground">
            You currently have <span className="text-primary font-semibold">{profile?.credits ?? 0}</span> credits
          </p>
        </div>

        {/* Coupon Section */}
        <Card className="mb-8 border-dashed">
          <CardContent className="pt-6">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium">Coupon Applied: <code className="bg-muted px-2 py-0.5 rounded">{appliedCoupon.code}</code></p>
                    <p className="text-sm text-muted-foreground">
                      {appliedCoupon.discount_type === "percentage"
                        ? `${appliedCoupon.discount_value}% off`
                        : `$${(appliedCoupon.discount_value / 100).toFixed(2)} off`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeCoupon}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="coupon" className="sr-only">Coupon Code</Label>
                  <Input
                    id="coupon"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>
                <Button variant="outline" onClick={applyCoupon} disabled={isValidatingCoupon}>
                  {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {creditPacks.map((pack) => {
            const discountedPrice = calculateDiscountedPrice(pack.price);
            const hasDiscount = appliedCoupon && discountedPrice < pack.price;

            return (
              <Card
                key={pack.id}
                className={`relative border-border/50 shadow-soft transition-all hover:shadow-elevated ${
                  pack.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
                    <pack.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-display">{pack.name}</CardTitle>
                  <CardDescription>{pack.credits} resume optimizations</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl text-muted-foreground line-through mr-2">${pack.price}</span>
                        <span className="text-4xl font-bold text-success">${discountedPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">${pack.price}</span>
                    )}
                    <span className="text-muted-foreground ml-2">
                      (${pack.pricePerCredit}/credit)
                    </span>
                  </div>
                  
                  <ul className="space-y-3 mb-6 text-left">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      {pack.credits} resume optimizations
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Full ATS score analysis
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      PDF export with templates
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success" />
                      Never expires
                    </li>
                  </ul>

                  <Button
                    variant={pack.popular ? "hero" : "outline"}
                    className="w-full"
                    onClick={() => handlePurchase(pack.id)}
                    disabled={loadingPack !== null}
                  >
                    {loadingPack === pack.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Buy ${pack.credits} Credits`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Secure payment powered by Stripe. Credits never expire.
        </p>
      </div>
    </div>
  );
}
