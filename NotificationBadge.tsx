import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  className?: string;
  showText?: boolean;
}

export default function NotificationBadge({ className = "", showText = false }: NotificationBadgeProps) {
  // Query for unread notification count
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/notifications'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  if (unreadCount === 0 && !showText) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500 border-2 border-white"
          variant="destructive"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      {showText && unreadCount > 0 && (
        <span className="ml-2 text-sm text-red-600 font-medium">
          {unreadCount} new
        </span>
      )}
    </div>
  );
}