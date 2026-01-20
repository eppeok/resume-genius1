import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, CreditCard, Receipt, Loader2, Package } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  amount: number;
  price_paid: number;
  description: string | null;
  created_at: string;
  stripe_session_id: string | null;
}

export default function TransactionHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data || []);
      }
      setIsLoading(false);
    };

    fetchTransactions();
  }, [user]);

  const totalCredits = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.reduce((sum, t) => sum + t.price_paid, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Transaction History - EvolvX"
        description="View your credit purchase history and transaction details."
        noIndex={true}
      />
      <Navigation />

      <main className="container max-w-4xl py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction History</h1>
            <p className="text-muted-foreground">View all your credit purchases</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Credits Purchased
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCredits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalSpent / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transactions
            </CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No transactions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your purchase history will appear here after you buy credits.
                </p>
                <Button onClick={() => navigate("/credits")}>
                  Buy Credits
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(transaction.created_at), "MMM d, yyyy")}
                          <span className="block text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {transaction.description || "Credit Purchase"}
                          </span>
                          {transaction.description?.includes("coupon") && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Discount Applied
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-mono">
                            +{transaction.amount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(transaction.price_paid / 100).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Credits */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate("/credits")}>
            Buy More Credits
          </Button>
        </div>
      </main>
    </div>
  );
}
