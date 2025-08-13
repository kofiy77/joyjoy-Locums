import { Clock, CheckCircle, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface StatsData {
  openShifts: number;
  confirmedShifts: number;
  activeStaff: number;
  fillRate: number;
}

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Open Shifts",
      value: stats?.openShifts || 0,
      change: "+12%",
      changeText: "from last week",
      icon: Clock,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      changeColor: "text-orange-600"
    },
    {
      title: "Confirmed Shifts",
      value: stats?.confirmedShifts || 0,
      change: "+8%",
      changeText: "from last week",
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      changeColor: "text-green-600"
    },
    {
      title: "Active Staff",
      value: stats?.activeStaff || 0,
      change: "+3",
      changeText: "new this week",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      changeColor: "text-green-600"
    },
    {
      title: "Fill Rate",
      value: `${stats?.fillRate || 0}%`,
      change: "+2%",
      changeText: "from last month",
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      changeColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="healthcare-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.changeColor}`}>{stat.change}</span>
              <span className="text-gray-600 ml-1">{stat.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
