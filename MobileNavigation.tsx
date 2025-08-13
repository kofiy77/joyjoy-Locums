import { Home, Users, Calendar, MessageSquare, Settings, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: Calendar, label: "Shifts", href: "/admin/shifts" },
  { icon: Users, label: "Staff", href: "/admin/staff" },
  { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
  { icon: AlertTriangle, label: "SMS Issues", href: "/admin/notifications" },
  { icon: Settings, label: "Settings", href: "/admin/settings" }
];

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden mobile-nav bg-white border-t border-gray-200 safe-area-inset-bottom">
      <nav className="flex justify-around items-center px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href === "/admin" && location === "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors mobile-tap-target",
                isActive 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}