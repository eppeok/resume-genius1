import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CreditCard, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalUsers: number;
  totalResumes: number;
  totalCreditsSpent: number;
  activeUsers: number;
}

export function StatsCards({ totalUsers, totalResumes, totalCreditsSpent, activeUsers }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: "Registered accounts",
    },
    {
      title: "Resumes Optimized",
      value: totalResumes,
      icon: FileText,
      description: "Total optimizations",
    },
    {
      title: "Credits Purchased",
      value: totalCreditsSpent,
      icon: CreditCard,
      description: "All time purchases",
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: TrendingUp,
      description: "Last 7 days",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
