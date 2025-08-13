import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import ShareWithFriends from "@/components/ShareWithFriends";
import { 
  Building2, 
  Users, 
  Calendar, 
  Settings, 
  User, 
  Shield,
  Home,
  Clock,
  FileText,
  BarChart3,
  Video,
  UserCheck,
  Bell,
  ChevronDown,
  UserCircle,
  UserPlus,
  LogOut
} from "lucide-react";
import joyJoyLogo from "../assets/joyjoy-logo.png";

export default function RoleBasedNavigation() {
  const { user, logout, validateSession } = useAuth();
  const [location] = useLocation();
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Extract user data if nested in response structure
  const actualUser = (user as any)?.user || user;
  
  // Check if user data is incomplete (missing firstName/lastName) and refresh if needed
  React.useEffect(() => {
    if (actualUser && !actualUser.firstName && !actualUser.lastName) {
      console.log('User data incomplete, refreshing session...');
      validateSession();
    }
  }, [actualUser, validateSession]);

  if (!user) return null;
  
  // Hide navigation for admin users on admin dashboard (we have custom mobile nav there)
  if (actualUser.type === 'admin' && location === '/admin') return null;
  
  // Hide navigation for care home managers on dashboard routes (they have custom navigation)
  if ((actualUser.type === 'care_home' || actualUser.type === 'care_home_manager') && (location === '/dashboard' || location === '/calendar' || location === '/timesheets')) return null;
  
  // Hide navigation for staff users on ALL portal routes (they have StaffHeader navigation)
  if (actualUser.type === 'staff' && (
    location === '/staff-portal' ||
    location === '/my-shifts' ||
    location === '/my-diary' ||
    location === '/timesheets' ||
    location === '/profile' ||
    location === '/shift-booking' ||
    location === '/shift-history' ||
    location === '/staff-onboarding' ||
    location === '/register' ||
    location === '/staff-registration' ||
    location === '/available-shifts' ||
    location.startsWith('/staff')
  )) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'care_home': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'System Admin';
      case 'care_home': return 'Care Home Manager';
      case 'staff': return 'Temporary Staff';
      default: return role;
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <img 
              src={joyJoyLogo} 
              alt="JoyJoy Care"
              className="h-52"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {/* Admin Navigation */}
            {actualUser.type === 'admin' && (
              <>
                <Link href="/admin">
                  <Button variant={isActive('/admin') ? 'default' : 'ghost'} size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant={isActive('/admin/users') ? 'default' : 'ghost'} size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant={isActive('/admin/analytics') ? 'default' : 'ghost'} size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/admin/manual-allocation">
                  <Button variant={isActive('/admin/manual-allocation') ? 'default' : 'ghost'} size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Manual Allocation
                  </Button>
                </Link>
                <Link href="/admin/notifications">
                  <Button variant={isActive('/admin/notifications') ? 'default' : 'ghost'} size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                </Link>
              </>
            )}

            {/* Care Home Manager Navigation */}
            {actualUser.type === 'care_home' && (
              <>
                <Link href="/dashboard">
                  <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/calendar">
                  <Button variant={isActive('/calendar') ? 'default' : 'ghost'} size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </Link>
              </>
            )}

            {/* Staff Navigation - REMOVED - All staff navigation handled by StaffHeader */}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(actualUser.type)}>
                    {actualUser.firstName && actualUser.lastName 
                      ? `${actualUser.firstName} ${actualUser.lastName}`
                      : getRoleLabel(actualUser.type)
                    }
                  </Badge>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center w-full">
                  <UserCircle className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Refer a Friend
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Share with Friends Dialog */}
      <ShareWithFriends
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        userFirstName={actualUser.firstName}
      />
    </nav>
  );
}