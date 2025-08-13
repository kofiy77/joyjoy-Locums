import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, UserCheck, Shield, MessageSquare, SeparatorVertical } from "lucide-react";

const quickActions = [
  {
    icon: CalendarPlus,
    title: "Bulk Shift Creation",
    description: "Create multiple shifts",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    action: "bulkShiftCreation"
  },
  {
    icon: UserCheck,
    title: "Staff Availability",
    description: "View staff schedules", 
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    action: "staffAvailability"
  },
  {
    icon: Shield,
    title: "Compliance Check",
    description: "Review certifications",
    iconBg: "bg-orange-100", 
    iconColor: "text-orange-500",
    action: "complianceCheck"
  },
  {
    icon: MessageSquare,
    title: "Bulk SMS",
    description: "Send notifications",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500", 
    action: "bulkSMS"
  }
];

export default function QuickActions() {
  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement actual action handlers
  };

  return (
    <Card className="healthcare-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="ghost"
              className="w-full flex items-center justify-between p-3 h-auto hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => handleQuickAction(action.action)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center`}>
                  <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
              <div className="text-gray-400">›</div>
            </Button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent SMS Activity</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shift offers sent</span>
              <span className="font-medium text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Confirmations</span>
              <span className="font-medium text-green-600">8</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending responses</span>
              <span className="font-medium text-orange-600">4</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
