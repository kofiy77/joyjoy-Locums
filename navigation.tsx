import { Bell, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/shifts", label: "Shifts" },
    { path: "/staff", label: "Staff" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <header className="bg-white healthcare-shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl text-primary">🏥</div>
              <span className="text-xl font-medium text-gray-900">CareStaff Connect</span>
            </div>
            <nav className="hidden md:flex space-x-8 ml-8">
              {navigationItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`pb-4 font-medium ${
                      location === item.path
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserRound className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
