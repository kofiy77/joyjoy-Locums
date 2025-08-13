import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserCircle, UserPlus, LogOut, ChevronDown, Calendar, FileText, Clock, User, History, Shield, HeartHandshake } from "lucide-react";
import ShareWithFriends from "@/components/ShareWithFriends";

interface StaffHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isInactive?: boolean;
}

export default function StaffHeader({ activeTab, onTabChange, isInactive = false }: StaffHeaderProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Extract user data if nested in response structure
  const actualUser = (user as any)?.user || user;
  const userName = actualUser?.firstName && actualUser?.lastName 
    ? `${actualUser.firstName} ${actualUser.lastName}`
    : actualUser?.email?.split('@')[0] || 'Staff Member';

  const handleNavigation = (tab: string, path: string) => {
    if (isInactive && tab !== 'profile') return; // Restrict navigation for inactive users
    if (onTabChange) onTabChange(tab);
    navigate(path);
  };

  const isActive = (tab: string) => activeTab === tab;

  return (
    <>
      <nav style={{ backgroundColor: 'var(--header-blue)' }} className="shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-white font-bold text-2xl flex items-center">
              <HeartHandshake className="h-8 w-8 mr-3 text-white" />
              JoyJoy Locums
            </div>
          </div>

          {/* Main Navigation - Only show on larger screens */}
          <div className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 text-white ${isActive('available-shifts') ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}`}
              onClick={() => handleNavigation('available-shifts', '/available-shifts')}
              disabled={isInactive}
            >
              <Clock className="h-4 w-4" />
              Find Shifts
            </Button>
            
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 text-white ${isActive('my-shifts') ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}`}
              onClick={() => handleNavigation('my-shifts', '/my-shifts')}
              disabled={isInactive}
            >
              <Calendar className="h-4 w-4" />
              My Shifts
            </Button>
            
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 text-white ${isActive('my-diary') ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}`}
              onClick={() => handleNavigation('my-diary', '/my-diary')}
              disabled={isInactive}
            >
              <Calendar className="h-4 w-4" />
              My Diary
            </Button>
            
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 text-white ${isActive('profile') ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}`}
              onClick={() => handleNavigation('profile', '/profile?tab=compliance')}
            >
              <Shield className="h-4 w-4" />
              Compliance
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-blue-700">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigation('available-shifts', '/available-shifts')}>
                  <Clock className="h-4 w-4 mr-2" />
                  Find Shifts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('my-shifts', '/my-shifts')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  My Shifts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('my-diary', '/my-diary')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  My Diary
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('profile', '/profile?tab=compliance')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Refer a Friend
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-blue-700 text-white bg-blue-600 border border-blue-600">
                  <UserCircle className="h-5 w-5" />
                  <span className="font-medium">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleNavigation('profile', '/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Refer a Friend
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Share Dialog */}
      <ShareWithFriends 
        isOpen={showShareDialog} 
        onClose={() => setShowShareDialog(false)} 
      />
    </>
  );
}