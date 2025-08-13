import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Navigation from "@/components/navigation";
import DashboardStats from "@/components/dashboard-stats";
import ShiftForm from "@/components/shift-form";
import QuickActions from "@/components/quick-actions";
import ShiftTable from "@/components/shift-table";
import StaffProfile from "@/components/staff-profile";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user } = useAuth();

  const isCareHome = user?.type === "care_home";
  const isStaff = user?.type === "staff";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />

        {isCareHome && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <ShiftForm />
              <QuickActions />
            </div>
            <ShiftTable />
          </>
        )}

        {isStaff && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StaffProfile />
            <div>
              <ShiftTable />
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg"
            className="w-14 h-14 rounded-full healthcare-shadow-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
