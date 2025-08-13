import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function TokenRefreshButton() {
  const { forceReAuthenticate } = useAuth();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear all corrupt tokens first
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth-storage');
      
      // Get fresh token from server
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token && data.user) {
          localStorage.setItem('auth_token', data.token);
          
          toast({
            title: "Authentication Refreshed",
            description: "Your session has been refreshed successfully.",
          });
          
          // Refresh the page to reload all components with new token
          window.location.reload();
        } else {
          throw new Error('No valid token received');
        }
      } else {
        throw new Error('Failed to get new token');
      }
    } catch (error) {
      toast({
        title: "Refresh Failed", 
        description: "Please try logging out and logging back in.",
        variant: "destructive"
      });
      // Redirect to login if refresh fails
      window.location.href = '/auth';
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
    </Button>
  );
}