import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Smartphone, Settings, AlertTriangle, Briefcase, Calendar, User, Megaphone, Loader2 } from "lucide-react";

interface NotificationPreferences {
  daily_shift_updates_email: boolean;
  daily_shift_updates_push: boolean;
  emergency_shifts_email: boolean;
  emergency_shifts_push: boolean;
  permanent_jobs_email: boolean;
  permanent_jobs_push: boolean;
  shift_application_updates_email: boolean;
  shift_application_updates_push: boolean;
  profile_alerts_email: boolean;
  profile_alerts_push: boolean;
  important_news_email: boolean;
  important_news_push: boolean;
}

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  emailKey: keyof NotificationPreferences;
  pushKey: keyof NotificationPreferences;
  required?: boolean;
}

const NotificationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Check if push notifications are supported and get current permission
  useEffect(() => {
    const checkPushSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          setIsPushSupported(true);
          setIsPushEnabled(Notification.permission === 'granted');
          console.log('📱 Push notification permission:', Notification.permission);
        } catch (error) {
          console.error('Push notification setup error:', error);
          setIsPushSupported(false);
        }
      } else {
        console.log('📱 Push notifications not supported on this device');
        setIsPushSupported(false);
      }
    };

    checkPushSupport();
  }, []);

  // Subscribe to push notifications
  const subscribeToPushMutation = useMutation({
    mutationFn: async () => {
      setIsSubscribing(true);
      
      if (!isPushSupported) {
        throw new Error('Push notifications are not supported on this device');
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key
      const vapidResponse = await apiRequest('/api/notifications/vapid-key');
      const { publicKey } = vapidResponse;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Send subscription to server
      await apiRequest('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription })
      });

      setIsPushEnabled(true);
      return subscription;
    },
    onSuccess: () => {
      toast({
        title: "Push Notifications Enabled",
        description: "You'll now receive push notifications on this device.",
      });
      setIsSubscribing(false);
    },
    onError: (error: any) => {
      console.error('Push subscription error:', error);
      toast({
        title: "Failed to Enable Push Notifications",
        description: error.message || "Please try again or check your browser settings.",
        variant: "destructive",
      });
      setIsSubscribing(false);
    }
  });

  // Test push notification
  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/test', {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Test Notification Sent",
          description: "Check your device for the test notification.",
        });
      } else {
        toast({
          title: "No Active Subscriptions",
          description: data.message || "Please enable push notifications first.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('Test notification error:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  });

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/notifications/preferences'],
    enabled: true
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      return apiRequest('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(newPreferences)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update notification preferences.",
        variant: "destructive"
      });
    }
  });

  // Enable push notifications
  const enablePushMutation = useMutation({
    mutationFn: async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Push notification permission denied');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from server
      const { publicKey } = await apiRequest('/api/notifications/vapid-key');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Send subscription to server
      await apiRequest('/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ subscription }),
        headers: { 'Content-Type': 'application/json' }
      });

      return subscription;
    },
    onSuccess: () => {
      setIsPushEnabled(true);
      toast({
        title: "Push notifications enabled",
        description: "You'll now receive push notifications on this device.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to enable push notifications",
        description: error.message || "Please check your browser settings.",
        variant: "destructive"
      });
    }
  });



  const notificationCategories: NotificationCategory[] = [
    {
      id: 'daily_shift_updates',
      title: 'Daily Shift Updates',
      description: 'Receive daily updates for shifts based on your availability, location and hourly rate preferences.',
      icon: Calendar,
      emailKey: 'daily_shift_updates_email',
      pushKey: 'daily_shift_updates_push'
    },
    {
      id: 'emergency_shifts',
      title: 'Emergency Shifts',
      description: 'Receive notifications when emergency shifts become available in your location.',
      icon: AlertTriangle,
      emailKey: 'emergency_shifts_email',
      pushKey: 'emergency_shifts_push'
    },
    {
      id: 'permanent_jobs',
      title: 'Permanent Jobs',
      description: 'Receive updates on permanent job opportunities.',
      icon: Briefcase,
      emailKey: 'permanent_jobs_email',
      pushKey: 'permanent_jobs_push'
    },
    {
      id: 'shift_application_updates',
      title: 'Shift Application Updates (you must select one option)',
      description: 'Receive updates on your shift application and booking status. Including cancellations and negotiations.',
      icon: Bell,
      emailKey: 'shift_application_updates_email',
      pushKey: 'shift_application_updates_push',
      required: true
    },
    {
      id: 'profile_alerts',
      title: 'Profile Alerts (you must select one option)',
      description: 'Receive updates on expiry dates on your profile. Including compliance documents and accreditations.',
      icon: User,
      emailKey: 'profile_alerts_email',
      pushKey: 'profile_alerts_push',
      required: true
    },
    {
      id: 'important_news',
      title: 'Important News and Updates',
      description: 'Receive newsletters on important news and updates.',
      icon: Megaphone,
      emailKey: 'important_news_email',
      pushKey: 'important_news_push'
    }
  ];

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      [key]: value
    };

    updatePreferencesMutation.mutate(updatedPreferences);
  };

  const handleEnablePush = () => {
    enablePushMutation.mutate();
  };

  const handleDisablePush = () => {
    setIsPushEnabled(false);
    toast({
      title: "Push notifications disabled",
      description: "Push notifications have been disabled for this device.",
    });
  };

  const handleTestNotification = () => {
    testNotificationMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-4"></div>
                <div className="flex gap-8">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Receive updates on recommended shifts based on your availability, location and hourly rate preferences.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Push Notification Setup */}
        {isPushSupported && !isPushEnabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Enable Push Notifications</h3>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Get instant notifications on your device when new shifts become available or important updates occur.
            </p>
            <Button 
              onClick={handleEnablePush}
              disabled={enablePushMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {enablePushMutation.isPending ? 'Enabling...' : 'Enable Push Notifications'}
            </Button>
          </div>
        )}

        {/* Shifts Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">SHIFTS</h3>
              <div className="flex items-center gap-8 mt-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">EMAIL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">PUSH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header with Icons directly above checkboxes */}
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div></div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">EMAIL</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">PUSH</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {notificationCategories.slice(0, 3).map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.id} className="grid grid-cols-3 gap-4 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{category.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.emailKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.emailKey, checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.pushKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.pushKey, checked)}
                      disabled={updatePreferencesMutation.isPending || !isPushEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Bookings Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">BOOKINGS</h3>
          </div>

          {/* Header with Icons directly above checkboxes */}
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div></div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">EMAIL</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">PUSH</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {notificationCategories.slice(3, 4).map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.id} className="grid grid-cols-3 gap-4 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{category.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.emailKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.emailKey, checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.pushKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.pushKey, checked)}
                      disabled={updatePreferencesMutation.isPending || !isPushEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Profile Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">PROFILE</h3>
          </div>

          {/* Header with Icons directly above checkboxes */}
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div></div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">EMAIL</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">PUSH</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {notificationCategories.slice(4, 5).map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.id} className="grid grid-cols-3 gap-4 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{category.title}</h4>
                      {category.required && (
                        <span className="text-xs text-red-600 font-medium ml-1">*Required</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.emailKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.emailKey, checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.pushKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.pushKey, checked)}
                      disabled={updatePreferencesMutation.isPending || !isPushEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Marketing Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">MARKETING</h3>
          </div>

          {/* Header with Icons directly above checkboxes */}
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div></div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">EMAIL</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center space-y-1">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-semibold text-gray-900 tracking-wide">PUSH</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {notificationCategories.slice(5).map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.id} className="grid grid-cols-3 gap-4 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{category.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.emailKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.emailKey, checked)}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={preferences?.[category.pushKey] || false}
                      onCheckedChange={(checked) => handleToggle(category.pushKey, checked)}
                      disabled={updatePreferencesMutation.isPending || !isPushEnabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status indicator */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isPushEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            Push notifications: {isPushEnabled ? 'Enabled' : 'Disabled'}
            {!isPushSupported && ' (Not supported on this device)'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;