import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Zap, Star, Crown } from "lucide-react";

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

export default function BuyCredits() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);

  const handlePurchase = async (packId: string, credits: number, price: number) => {
    setLoadingPack(packId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ credits, price }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
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
      <Navigation />
      
      <div className="container max-w-5xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Buy Credits</h1>
          <p className="text-xl text-muted-foreground">
            You currently have <span className="text-primary font-semibold">{profile?.credits ?? 0}</span> credits
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {creditPacks.map((pack) => (
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
                  <span className="text-4xl font-bold">${pack.price}</span>
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
                  onClick={() => handlePurchase(pack.id, pack.credits, pack.price)}
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
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Secure payment powered by Stripe. Credits never expire.
        </p>
      </div>
    </div>
  );
}
