import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Phone, MessageSquare, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface FailedNotification {
  id: number;
  phone_number: string;
  message: string;
  status: string;
  sent_at: string;
  message_type: string;
  error_code?: string;
  error_message?: string;
}

export default function AdminNotifications() {
  const { data: failedNotifications, isLoading, refetch } = useQuery<FailedNotification[]>({
    queryKey: ["/api/admin/failed-notifications"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'failed': return 'destructive';
      case 'pending': return 'outline';
      case 'sent': return 'default';
      default: return 'secondary';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2 mb-6">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading failed notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">SMS & WhatsApp Notifications</h1>
          <p className="text-muted-foreground">
            Monitor failed notifications that require manual follow-up
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {failedNotifications?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Failed Notifications</h3>
            <p className="text-muted-foreground text-center">
              All SMS and WhatsApp notifications are being delivered successfully.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                SMS Configuration Issue Detected
              </h3>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 mt-2">
              Your Twilio phone number +447897012980 is experiencing configuration issues. 
              Please check your Twilio Console for phone number status and SMS capabilities.
            </p>
          </div>

          {failedNotifications?.map((notification) => (
            <Card key={notification.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getMessageTypeIcon(notification.message_type)}
                    <CardTitle className="text-lg">
                      {notification.phone_number}
                    </CardTitle>
                    <Badge variant={getStatusColor(notification.status)}>
                      {notification.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(notification.sent_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Message Content:</h4>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      {notification.message}
                    </div>
                  </div>
                  
                  {notification.error_code && (
                    <div>
                      <h4 className="font-medium mb-1">Error Details:</h4>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                        <p className="text-sm">
                          <span className="font-medium">Code:</span> {notification.error_code}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Message:</span> {notification.error_message}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${notification.phone_number}`, '_self')}
                    >
                      <Phone className="mr-1 h-3 w-3" />
                      Call Staff
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const message = encodeURIComponent(notification.message);
                        window.open(`sms:${notification.phone_number}?body=${message}`, '_self');
                      }}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Send Manual SMS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}