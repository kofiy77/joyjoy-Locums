import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function NotFound() {
  const { user, isAuthenticated } = useAuth();

  const getHomeRoute = () => {
    if (!isAuthenticated) return "/";
    
    switch (user?.type) {
      case 'admin':
        return "/admin";
      case 'care_home':
        return "/dashboard";
      case 'staff':
        return "/staff-portal";
      default:
        return "/";
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 mb-6">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="flex flex-col gap-2">
            <Link href={getHomeRoute()}>
              <Button className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
