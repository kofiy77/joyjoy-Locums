import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X,
  Eye,
  Users,
  Calendar,
  FileText,
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: 'new_registration' | 'document_upload' | 'shift_urgent' | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface AdminNotificationCenterProps {
  onNavigateToTab?: (tabName: string) => void;
}

export default function AdminNotificationCenter({ onNavigateToTab }: AdminNotificationCenterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Query for notifications
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/admin/notifications'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Query for recent staff registrations (last 24 hours)
  const { data: recentRegistrations = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/recent-registrations'],
    refetchInterval: 60000 // Refresh every minute
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/admin/notifications/mark-all-read', {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      toast({
        title: "Success",
        description: "Notification deleted"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_registration': return <UserPlus className="h-4 w-4" />;
      case 'document_upload': return <FileText className="h-4 w-4" />;
      case 'shift_urgent': return <Clock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Mock notifications for demonstration (replace with real API data)
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'new_registration',
      title: 'New Staff Registration',
      message: 'Sophie Williams has completed registration and submitted documents for review',
      priority: 'high',
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      data: { userId: 'user-123', name: 'Sophie Williams', role: 'Healthcare Assistant' }
    },
    {
      id: '2',
      type: 'new_registration',
      title: 'New Staff Registration',
      message: 'Michael Chen has registered and is awaiting document verification',
      priority: 'medium',
      isRead: false,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      data: { userId: 'user-124', name: 'Michael Chen', role: 'Registered Nurse' }
    },
    {
      id: '3',
      type: 'document_upload',
      title: 'Document Verification Required',
      message: 'Lisa Johnson has uploaded DBS certificate requiring verification',
      priority: 'medium',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      data: { userId: 'user-125', name: 'Lisa Johnson', documentType: 'DBS Certificate' }
    },
    {
      id: '4',
      type: 'shift_urgent',
      title: 'Urgent Shift Coverage Needed',
      message: 'Emergency shift at Golden Meadows Care Home requires immediate attention',
      priority: 'urgent',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      data: { shiftId: 'shift-789', careHome: 'Golden Meadows Care Home', date: '2025-01-03' }
    }
  ];

  const displayNotifications = (notifications as Notification[]).length > 0 ? (notifications as Notification[]) : mockNotifications;
  const unreadCount = (displayNotifications as Notification[]).filter((n: Notification) => !n.isRead).length;
  const urgentCount = (displayNotifications as Notification[]).filter((n: Notification) => !n.isRead && n.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      {/* Notification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-blue-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notification Center</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'}
              {urgentCount > 0 && (
                <span className="ml-2 text-red-600 font-semibold">
                  • {urgentCount} urgent
                </span>
              )}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onNavigateToTab?.('users')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(recentRegistrations as any[]).length || 2}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onNavigateToTab?.('documents')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onNavigateToTab?.('shifts')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onNavigateToTab?.('notifications')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Today</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(displayNotifications as Notification[]).filter((n: Notification) => {
                const today = new Date();
                const notificationDate = new Date(n.createdAt);
                return notificationDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            Stay updated with the latest system activities and staff registrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (displayNotifications as Notification[]).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            (displayNotifications as Notification[]).map((notification: Notification, index: number) => (
              <div key={notification.id}>
                <Alert 
                  className={`relative transition-all hover:shadow-md cursor-pointer ${
                    notification.isRead ? 'opacity-70' : ''
                  } ${getPriorityColor(notification.priority)}`}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <AlertTitle className="text-sm font-semibold">
                          {notification.title}
                        </AlertTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.priority}
                          </Badge>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <AlertDescription className="text-sm mb-2">
                        {notification.message}
                      </AlertDescription>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notification.id);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(notification);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
                
                {index < (displayNotifications as Notification[]).length - 1 && <Separator className="my-4" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedNotification.type)}
                  {selectedNotification.title}
                </CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotification(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className={getPriorityColor(selectedNotification.priority)}>
                  {selectedNotification.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
              
              <p>{selectedNotification.message}</p>
              
              {selectedNotification.data && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-semibold mb-2">Details:</h4>
                  <div className="space-y-2 text-sm">
                    {selectedNotification.type === 'document_upload' && (
                      <>
                        <div><span className="font-medium">Document Type:</span> {selectedNotification.data.documentType?.replace('_', ' ').toUpperCase()}</div>
                        {selectedNotification.data.title && (
                          <div><span className="font-medium">Document:</span> {selectedNotification.data.title}</div>
                        )}
                      </>
                    )}
                    {selectedNotification.type === 'new_registration' && (
                      <>
                        {selectedNotification.data.name && (
                          <div><span className="font-medium">Staff Member:</span> {selectedNotification.data.name}</div>
                        )}
                        {selectedNotification.data.email && (
                          <div><span className="font-medium">Email:</span> {selectedNotification.data.email}</div>
                        )}
                        {selectedNotification.data.approvalStatus && (
                          <div><span className="font-medium">Status:</span> {selectedNotification.data.approvalStatus.replace('_', ' ')}</div>
                        )}
                      </>
                    )}
                    {selectedNotification.type === 'shift_urgent' && (
                      <>
                        {selectedNotification.data.careHome && (
                          <div><span className="font-medium">Care Home:</span> {selectedNotification.data.careHome}</div>
                        )}
                        {selectedNotification.data.role && (
                          <div><span className="font-medium">Role:</span> {selectedNotification.data.role}</div>
                        )}
                        {selectedNotification.data.date && (
                          <div><span className="font-medium">Date:</span> {new Date(selectedNotification.data.date).toLocaleDateString()}</div>
                        )}
                        {selectedNotification.data.type && (
                          <div><span className="font-medium">Shift Type:</span> {selectedNotification.data.type}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {!selectedNotification.isRead && (
                  <Button
                    onClick={() => {
                      markAsReadMutation.mutate(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                    disabled={markAsReadMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                
                {selectedNotification.type === 'new_registration' && (
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View User Profile
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    deleteNotificationMutation.mutate(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  disabled={deleteNotificationMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}