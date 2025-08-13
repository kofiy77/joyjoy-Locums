import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Users, Building2, Calendar, FileText, Shield, UserPlus, MessageSquare,
  Clock, CheckCircle, XCircle, Edit, Trash2, Eye, Award, AlertTriangle, LogOut,
  Search, MapPin, MoreHorizontal, Mail, Download, Plus, DollarSign,
  Phone, Home, Filter, Upload, Settings, TrendingUp, Activity, Menu, Lock,
  Timer, ClipboardCheck, AlertCircle, CheckSquare, ChevronDown, Bell,
  Stethoscope, UserCog, HeartHandshake, Hospital, Briefcase, CreditCard,
  UserCheck, BarChart3, PieChart, TrendingDown, Calculator
} from "lucide-react";
import { CreateCareHomeManagerDialog } from "@/components/CreateCareHomeManagerDialog";
import { CreateBusinessSupportDialog } from "@/components/CreateBusinessSupportDialog";
import { BusinessSupportUserManager } from "@/components/BusinessSupportUserManager";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import ComprehensiveShiftManagement from "@/components/ComprehensiveShiftManagement";
import InternalDocumentManager from "@/components/InternalDocumentManager";
import TimesheetManagement from "@/components/TimesheetManagement";
import { EnhancedUserManagement } from "@/components/EnhancedUserManagement";
import { MinimalUsersList } from "@/components/MinimalUsersList";
import { ComprehensiveUserManagement } from "@/components/ComprehensiveUserManagement";
import InvoiceManagement from "@/components/InvoiceManagement";
import ShiftKPIDashboard from "@/components/ShiftKPIDashboard";
import UnifiedCertificationManager from "@/components/unified-certification-manager";
import AdminNotificationCenter from "@/components/AdminNotificationCenter";
import NotificationBadge from "@/components/NotificationBadge";
import UKMapView from "@/components/uk-map-view";
import UKLocumRateCardManager from "@/components/UKLocumRateCardManager";
import SelfBillingInvoiceEngine from "@/components/SelfBillingInvoiceEngine";
import joyJoyLogo from "@/assets/joyjoy-logo.png";

export default function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Debug logging
  console.log('🚀 AdminDashboard rendering:', { user, activeTab, isAuthenticated });

  // Single useEffect to handle initialization and auth state
  useEffect(() => {
    console.log('🚀 AdminDashboard initialization');
    setIsInitialized(true);
    
    if (user || isAuthenticated) {
      console.log('✅ Auth state confirmed, dashboard ready');
      // Trigger data refresh when authentication is confirmed
      const timer = setTimeout(() => {
        console.log('🔄 Triggering refresh after auth confirmation');
        queryClient.invalidateQueries();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, queryClient]);
  const [showCreateManagerDialog, setShowCreateManagerDialog] = useState(false);
  const [showCreateBusinessSupportDialog, setShowCreateBusinessSupportDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showRateCardDialog, setShowRateCardDialog] = useState(false);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);
  const [showDocumentEditDialog, setShowDocumentEditDialog] = useState(false);
  const [showCreateCareHomeDialog, setShowCreateCareHomeDialog] = useState(false);
  const [showEditCareHomeDialog, setShowEditCareHomeDialog] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCertStatus, setFilterCertStatus] = useState("all");
  const [filterDocStatus, setFilterDocStatus] = useState("all");
  
  // Selection states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);
  const [selectedRateCard, setSelectedRateCard] = useState<any>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [selectedCareHome, setSelectedCareHome] = useState<any>(null);
  
  // Dialog states
  const [showFeedbackResponseDialog, setShowFeedbackResponseDialog] = useState(false);
  const [showFeedbackHistoryDialog, setShowFeedbackHistoryDialog] = useState(false);
  
  // Feedback response form state
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Comprehensive data queries - with error handling to prevent blocking
  const { data: users = [], error: usersError } = useQuery({ 
    queryKey: ['/api/admin/users'],
    retry: 1 // Reduce retry attempts
  });
  const { data: careHomes = [], error: careHomesError } = useQuery({ 
    queryKey: ['/api/admin/care-homes'],
    retry: 1
  });
  const { data: shifts = [], error: shiftsError } = useQuery({ 
    queryKey: ['/api/shifts'],
    retry: 1
  });
  const { data: certifications = [], error: certificationsError } = useQuery({ 
    queryKey: ['/api/certifications'],
    retry: 1
  });
  const { data: documents = [], error: documentsError } = useQuery({ 
    queryKey: ['/api/admin/documents'],
    retry: 1
  });
  const { data: rateCards = [], error: rateCardsError } = useQuery({ 
    queryKey: ['/api/rate-cards'],
    retry: 1
  });
  const { data: enquiries = [], error: enquiriesError } = useQuery({ 
    queryKey: ['/api/admin/care-home-enquiries'],
    retry: 1
  });
  const { data: auditLogs = [], error: auditLogsError } = useQuery({ 
    queryKey: ['/api/admin/audit-logs'],
    retry: 1
  });
  const { data: smsMessages = [], error: smsMessagesError } = useQuery({ 
    queryKey: ['/api/admin/sms-messages'],
    retry: 1
  });
  // Force dashboard stats query with aggressive retry and enabled state
  const { data: dashboardStats = {}, isLoading: isDashboardStatsLoading, error: dashboardStatsError } = useQuery({ 
    queryKey: ['/api/admin/dashboard-stats'],
    retry: 3,
    enabled: true, // Force enable
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always fresh
    onSuccess: (data) => {
      console.log('🎯 Dashboard stats loaded successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Dashboard stats error:', error);
    }
  });

  // Log any query errors
  console.log('🔍 Query errors:', { 
    usersError, careHomesError, shiftsError, certificationsError, 
    documentsError, rateCardsError, enquiriesError, auditLogsError, 
    smsMessagesError, dashboardStatsError 
  });
  
  // Debug dashboard stats
  console.log('🎯 Dashboard stats debug:', { 
    dashboardStats, 
    isDashboardStatsLoading, 
    dashboardStatsError,
    totalUsers: (dashboardStats as any)?.totalUsers,
    totalCareHomes: (dashboardStats as any)?.totalCareHomes,
    totalShifts: (dashboardStats as any)?.totalShifts
  });
  const { data: timesheets = [] } = useQuery({ 
    queryKey: ['/api/admin/timesheets'],
    enabled: activeTab === 'timesheets'
  });
  const { data: timesheetStats = {} } = useQuery({ 
    queryKey: ['/api/admin/timesheets/stats'],
    enabled: activeTab === 'timesheets'
  });
  const { data: feedbackData = [] } = useQuery({ 
    queryKey: ['/api/admin/feedback'],
    enabled: activeTab === 'feedback'
  });

  // Enhanced filtering logic
  const filteredUsers = Array.isArray(users) ? users.filter((user: any) => {
    const matchesSearch = !searchTerm || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.type === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const filteredCertifications = Array.isArray(certifications) ? certifications.filter((cert: any) => {
    const matchesSearch = !searchTerm || 
      cert.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterCertStatus === 'all' || cert.verificationStatus === filterCertStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const filteredDocuments = Array.isArray(documents) ? documents.filter((doc: any) => {
    const matchesSearch = !searchTerm || 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterDocStatus === 'all' || doc.status === filterDocStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  const filteredRateCards = Array.isArray(rateCards) ? rateCards.filter((rc: any) => {
    const matchesRole = filterRole === 'all' || rc.role === filterRole;
    return matchesRole;
  }) : [];

  // Comprehensive mutations for admin operations
  const verifyCertificationMutation = useMutation({
    mutationFn: async ({ certId, action, notes }: any) => 
      apiRequest(`/api/admin/certifications/${certId}/verify`, 'POST', { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      toast({ title: "Certification updated successfully" });
    }
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ docId, action, notes }: any) => 
      apiRequest(`/api/admin/documents/${docId}/verify`, 'POST', { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({ title: "Document updated successfully" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => 
      apiRequest(`/api/admin/users/${userData.id}`, 'PUT', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User updated successfully" });
      setShowUserEditDialog(false);
    }
  });

  const updateRateCardMutation = useMutation({
    mutationFn: async (rateCardData: any) => 
      apiRequest(`/api/admin/rate-cards/${rateCardData.id}`, 'PUT', rateCardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rate-cards'] });
      toast({ title: "Rate card updated successfully" });
      setShowRateCardDialog(false);
      setSelectedRateCard(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update rate card",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Feedback response mutation
  const submitFeedbackResponseMutation = useMutation({
    mutationFn: async ({ feedbackId, response }: { feedbackId: string; response: string }) => 
      apiRequest(`/api/admin/feedback/${feedbackId}/response`, 'POST', { response }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback'] });
      toast({ title: "Response submitted successfully" });
      setShowFeedbackResponseDialog(false);
      setSelectedFeedback(null);
      setResponseText("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit response",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle feedback response submission
  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) {
      toast({ 
        title: "Please enter a response",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingResponse(true);
    try {
      await submitFeedbackResponseMutation.mutateAsync({
        feedbackId: selectedFeedback.id,
        response: responseText.trim()
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (showFeedbackResponseDialog && selectedFeedback) {
      // Pre-populate with existing response if editing
      setResponseText(selectedFeedback.adminResponse || "");
    } else if (!showFeedbackResponseDialog) {
      setResponseText("");
    }
  }, [showFeedbackResponseDialog, selectedFeedback]);

  // Simplified loading check - only show loading during very initial load
  if (!isInitialized && (!user && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Force render content even if user state is partially loaded
  console.log('🎯 Rendering dashboard content - isInitialized:', isInitialized, 'user:', !!user, 'isAuthenticated:', isAuthenticated);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Top Navigation Header */}
      <nav className="bg-blue-800 border-b border-blue-900 px-6 py-4 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <HeartHandshake className="h-10 w-10 text-white" />
            <div>
              <h1 className="text-xl font-semibold text-white">JoyJoy Locums Admin Portal</h1>
              <p className="text-sm text-blue-200">Medical Staffing Management System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge className="bg-blue-600 text-blue-100 text-xs">
                <Stethoscope className="h-3 w-3 mr-1" />
                Medical Admin
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="text-blue-200 hover:text-white hover:bg-blue-700"
            >
              <Hospital className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePasswordDialog(true)}
              className="border-blue-300 text-blue-100 hover:bg-blue-700"
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('🔄 Force clearing all authentication cache...');
                localStorage.clear();
                sessionStorage.clear();
                queryClient.clear();
                await queryClient.invalidateQueries();
                console.log('🔄 Cache cleared, forcing re-authentication...');
                window.location.reload();
              }}
              className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Force Reset Auth
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="m-4">
                <Menu className="h-4 w-4" />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setActiveTab("overview")}>
                <Home className="h-4 w-4 mr-2" />
                Overview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("users")}>
                <Users className="h-4 w-4 mr-2" />
                Users
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("care-homes")}>
                <Building2 className="h-4 w-4 mr-2" />
                Care Homes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("shifts")}>
                <Calendar className="h-4 w-4 mr-2" />
                Shifts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("timesheets")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Timesheets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("certifications")}>
                <Award className="h-4 w-4 mr-2" />
                Certifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("documents")}>
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("rate-cards")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Rate Cards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("invoices")}>
                <FileText className="h-4 w-4 mr-2" />
                Invoices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("onboarding")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Onboarding
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("kpi")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                KPI Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open('/', '_blank')}>
                <Home className="h-4 w-4 mr-2" />
                Visit Website
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  console.log('🔄 Force clearing all authentication cache...');
                  localStorage.clear();
                  sessionStorage.clear();
                  queryClient.clear();
                  await queryClient.invalidateQueries();
                  console.log('🔄 Cache cleared, forcing re-authentication...');
                  window.location.reload();
                }}
                className="text-yellow-800"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Force Reset Auth
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">


            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Desktop Tab Navigation */}
              <div className="hidden md:flex w-full bg-muted/30 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "overview" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Overview
                </button>

                {/* Staff Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        ["users", "timesheets", "certifications", "shifts", "onboarding"].includes(activeTab)
                          ? "bg-background text-foreground shadow-sm" 
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Staff
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => setActiveTab("users")}>
                      <Users className="h-4 w-4 mr-2" />
                      Staff Management
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveTab("timesheets")}>
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Timesheets
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab("certifications")}>
                      <Award className="h-4 w-4 mr-2" />
                      Certifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab("shifts")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Shifts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab("onboarding")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Staff Onboarding
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => setActiveTab("care-homes")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "care-homes" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Hospital className="h-4 w-4" />
                  GP Practices
                </button>

                <button
                  onClick={() => setActiveTab("kpi")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "kpi" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  KPIs
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "documents" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Documents
                </button>

                <button
                  onClick={() => setActiveTab("rate-cards")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "rate-cards" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Calculator className="h-4 w-4" />
                  Locum Rates
                </button>

                <button
                  onClick={() => setActiveTab("self-billing")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "self-billing" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  Self-Billing
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "notifications" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <NotificationBadge className="text-inherit" />
                  Notifications
                </button>

                <button
                  onClick={() => setActiveTab("business-support")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "business-support" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Business Support
                </button>

                <button
                  onClick={() => setActiveTab("feedback")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "feedback" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Feedback
                </button>

                <button
                  onClick={() => setActiveTab("map-view")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === "map-view" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  UK Map View
                </button>
              </div>

              {/* Enhanced Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Content fully rendered and working */}
                
                {/* Enhanced Statistics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setActiveTab("users")}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(dashboardStats as any)?.totalUsers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Active: {(dashboardStats as any)?.activeUsers || 0} | 
                        Total: {(dashboardStats as any)?.totalUsers || 0}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setActiveTab("care-homes")}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Care Facilities</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(dashboardStats as any)?.totalCareHomes || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Active: {(dashboardStats as any)?.activeFacilities || 0} facilities
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setActiveTab("shifts")}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Shift Analytics</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(dashboardStats as any)?.totalShifts || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Open: {(dashboardStats as any)?.openShifts || 0} | 
                        Accepted: {(dashboardStats as any)?.acceptedShifts || 0}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setActiveTab("certifications")}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(dashboardStats as any)?.validCertifications || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Valid certifications | 
                        {(dashboardStats as any)?.pendingCertifications || 0} expiring
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Administrative Actions & System Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 h-auto p-4"
                        onClick={() => setShowCreateManagerDialog(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-medium">Create Care Home Manager</div>
                          <div className="text-sm text-muted-foreground">Add new facility account</div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 h-auto p-4"
                        onClick={() => setActiveTab("certifications")}
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <div className="text-left">
                          <div className="font-medium">Review Certifications</div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(certifications) ? certifications.filter((c: any) => c.status === 'pending').length : 0} pending review
                          </div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 h-auto p-4"
                        onClick={() => setActiveTab("documents")}
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium">Review Documents</div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(documents) ? documents.filter((d: any) => d.status === 'pending').length : 0} awaiting approval
                          </div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 h-auto p-4"
                        onClick={() => setActiveTab("rate-cards")}
                      >
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div className="text-left">
                          <div className="font-medium">Manage Rate Cards</div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(rateCards) ? rateCards.length : 0} rate configurations
                          </div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 h-auto p-4"
                        onClick={() => setActiveTab("onboarding")}
                      >
                        <UserPlus className="h-4 w-4 text-purple-500" />
                        <div className="text-left">
                          <div className="font-medium">Staff Onboarding</div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(enquiries) ? enquiries.filter((e: any) => e.status === 'new').length : 0} new enquiries
                          </div>
                        </div>
                      </Button>

                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start gap-2 h-auto p-4"
                        onClick={() => setActiveTab("shifts")}
                      >
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        <div className="text-left">
                          <div className="font-medium">Shift Analytics</div>
                          <div className="text-sm text-muted-foreground">
                            Monitor allocation patterns
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Activity Feed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent System Activity & Audit Log
                    </CardTitle>
                    <CardDescription>Latest administrative actions and system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(auditLogs) && auditLogs.slice(0, 8).map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-500">
                              {log.entityType} • {new Date(log.createdAt).toLocaleString()}
                              {log.ipAddress && ` • IP: ${log.ipAddress}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{log.adminUserProfileId ? 'Admin' : 'System'}</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {(!Array.isArray(auditLogs) || auditLogs.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-8">No recent activity logged</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <ComprehensiveUserManagement />
              </TabsContent>

              {/* Staff Certifications & Compliance Tab */}
              <TabsContent value="certifications" className="space-y-4">
                <UnifiedCertificationManager staffId={0} />
              </TabsContent>

              {/* Comprehensive Timesheets Tab - Admin Oversight */}
              <TabsContent value="timesheets" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Timesheets</CardTitle>
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(dashboardStats as any)?.timesheets?.total || (timesheetStats as any)?.total_timesheets || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Across all care homes
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Manager Approval</CardTitle>
                      <Timer className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">{(dashboardStats as any)?.timesheets?.pending || (timesheetStats as any)?.pending_approval || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting care home manager review
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Hours This Week</CardTitle>
                      <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{(timesheetStats as any)?.total_hours_this_week || 0}h</div>
                      <p className="text-xs text-muted-foreground">
                        {(timesheetStats as any)?.overtime_hours || 0}h overtime
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
                      <CheckSquare className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{(timesheetStats as any)?.compliance_rate || 0}%</div>
                      <p className="text-xs text-muted-foreground">
                        On-time submission rate
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5" />
                      Timesheet System Overview & Reporting
                    </CardTitle>
                    <CardDescription>
                      Monitor timesheet submissions and approval status across all care homes. Care home managers approve timesheets.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Filter Controls */}
                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <Input
                          placeholder="Search by staff name or care home..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-80"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending_manager_approval">Pending Manager Approval</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline">
                        {Array.isArray(timesheets) ? timesheets.filter((ts: any) => {
                          const matchesSearch = !searchTerm || 
                            ts.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ts.care_home_name?.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesStatus = filterStatus === 'all' || ts.status === filterStatus;
                          return matchesSearch && matchesStatus;
                        }).length : 0} of {Array.isArray(timesheets) ? timesheets.length : 0} timesheets
                      </Badge>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Approval Workflow</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Care home managers approve timesheets for their facilities. Admins have oversight and reporting access only.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timesheets List */}
                    <div className="space-y-4">
                      {Array.isArray(timesheets) && timesheets
                        .filter((timesheet: any) => {
                          const matchesSearch = !searchTerm || 
                            timesheet.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            timesheet.care_home_name?.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesStatus = filterStatus === 'all' || timesheet.status === filterStatus;
                          return matchesSearch && matchesStatus;
                        })
                        .map((timesheet: any) => (
                        <Card key={timesheet.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div>
                                    <h4 className="font-medium">{timesheet.staff_name}</h4>
                                    <p className="text-sm text-gray-500">{timesheet.staff_email}</p>
                                  </div>
                                  <Badge variant="outline" className="ml-auto">
                                    {timesheet.care_home_name}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-600">
                                  <span>Week: {new Date(timesheet.week_start).toLocaleDateString()} - {new Date(timesheet.week_end).toLocaleDateString()}</span>
                                  <span>Total Hours: {timesheet.total_hours}h</span>
                                  {timesheet.submitted_at && (
                                    <span>Submitted: {new Date(timesheet.submitted_at).toLocaleDateString()}</span>
                                  )}
                                  {timesheet.approved_at && (
                                    <span>Approved: {new Date(timesheet.approved_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant={
                                    timesheet.status === 'approved' ? 'default' :
                                    timesheet.status === 'pending_manager_approval' ? 'secondary' :
                                    'outline'
                                  }
                                  className={
                                    timesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    timesheet.status === 'pending_manager_approval' ? 'bg-amber-100 text-amber-800' :
                                    ''
                                  }
                                >
                                  {timesheet.status === 'approved' ? 'Approved' :
                                   timesheet.status === 'pending_manager_approval' ? 'Pending Manager Approval' :
                                   'Draft'}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {(!Array.isArray(timesheets) || timesheets.length === 0) && (
                        <div className="text-center py-12">
                          <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Timesheets Found</h3>
                          <p className="text-gray-500">Timesheets will appear here once staff start submitting their weekly hours.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* TimesheetManagement Component */}
                <TimesheetManagement 
                  userType="admin"
                  userId={user?.id || ""}
                />
              </TabsContent>

              {/* Enhanced Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <InternalDocumentManager />
              </TabsContent>
              
              {/* Legacy Documents Tab Content - TO BE REMOVED */}
              <TabsContent value="documents-legacy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Management & Verification System
                    </CardTitle>
                    <CardDescription>
                      Review, approve, and manage all system documents with secure storage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Document Filter Controls */}
                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <Input
                          placeholder="Search by document title or type..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-80"
                        />
                      </div>
                      <Select value={filterDocStatus} onValueChange={setFilterDocStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline">
                        {filteredDocuments.length} of {Array.isArray(documents) ? documents.length : 0} documents
                      </Badge>
                    </div>

                    {/* Document List */}
                    <div className="space-y-4">
                      {Array.isArray(filteredDocuments) && filteredDocuments.map((doc: any) => (
                        <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{doc.title}</h3>
                                  <p className="text-gray-600">{doc.documentType}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <Upload className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                {doc.expiryDate && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{doc.entityType}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Badge variant={
                                doc.status === 'approved' ? 'default' : 
                                doc.status === 'pending' ? 'secondary' : 
                                doc.status === 'rejected' ? 'destructive' :
                                'outline'
                              }>
                                {doc.status?.toUpperCase()}
                              </Badge>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Document
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => verifyDocumentMutation.mutate({ 
                                      docId: doc.id, 
                                      action: 'approve',
                                      notes: 'Approved by admin' 
                                    })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => verifyDocumentMutation.mutate({ 
                                      docId: doc.id, 
                                      action: 'reject',
                                      notes: 'Rejected by admin' 
                                    })}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Details
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>


              </TabsContent>

              {/* Enhanced Shifts Tab with Comprehensive Management */}
              <TabsContent value="shifts" className="space-y-4">
                <ComprehensiveShiftManagement 
                  shifts={Array.isArray(shifts) ? shifts : []} 
                  onRefresh={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
                  }}
                />
              </TabsContent>

              {/* Enhanced Care Homes Tab */}
              <TabsContent value="care-homes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Care Home Management & Facility Oversight
                    </CardTitle>
                    <CardDescription>
                      Comprehensive management of care facilities with contract and compliance tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Care Home Filter Controls */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          <Input
                            placeholder="Search by facility name, location, or manager..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-80"
                          />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline">
                          {Array.isArray(careHomes) ? careHomes.length : 0} facilities
                        </Badge>
                      </div>
                      
                      {/* Add Care Facility Button */}
                      <Button 
                        onClick={() => setShowCreateCareHomeDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Care Facility
                      </Button>
                    </div>

                    {/* Care Home List */}
                    <div className="space-y-4">
                      {Array.isArray(careHomes) && careHomes.map((careHome: any) => (
                        <div key={careHome.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{careHome.name}</h3>
                                  <p className="text-gray-600">{careHome.address}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">Capacity: {careHome.capacity || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{careHome.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{careHome.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{careHome.postcode}</span>
                                </div>
                              </div>

                              {careHome.managerName && (
                                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                  <h4 className="font-medium text-sm mb-2">Facility Management</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="text-sm">Manager: {careHome.managerName}</span>
                                    <span className="text-sm">Contact: {careHome.managerPhone}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-start gap-2">
                              <div className="flex flex-col gap-2">
                                <Badge variant={
                                  careHome.contractStatus === 'active' ? 'default' : 
                                  careHome.contractStatus === 'pending' ? 'secondary' : 
                                  'destructive'
                                }>
                                  {careHome.contractStatus?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                                {careHome.cqcRating && (
                                  <Badge variant="outline" className="text-xs">
                                    CQC: {careHome.cqcRating}
                                  </Badge>
                                )}
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedCareHome(careHome);
                                      setShowEditCareHomeDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Facility Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Full Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    View Shift History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Manage Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Billing & Invoices
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Suspend Contract
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rate Cards Tab */}
              <TabsContent value="rate-cards" className="space-y-4">
                <UKLocumRateCardManager />
              </TabsContent>

              {/* Enhanced Onboarding Tab */}
              <TabsContent value="onboarding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Staff Onboarding & Care Home Enquiries
                    </CardTitle>
                    <CardDescription>
                      Manage new staff registrations and care home partnership enquiries
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Staff Onboarding Panel */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Staff Registration Pipeline</h3>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Documents Pending Review</span>
                            <Badge variant="secondary">
                              {Array.isArray(documents) ? documents.filter((d: any) => d.status === 'pending').length : 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Staff members awaiting document approval</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab("documents")}>
                            Review Documents
                          </Button>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Certification Reviews</span>
                            <Badge variant="secondary">
                              {Array.isArray(certifications) ? certifications.filter((c: any) => c.status === 'pending').length : 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Professional certifications requiring verification</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab("certifications")}>
                            Review Certifications
                          </Button>
                        </div>
                      </div>

                      {/* Care Home Enquiries Panel */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Care Home Partnership Enquiries</h3>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">New Enquiries</span>
                            <Badge variant="secondary">
                              {Array.isArray(enquiries) ? enquiries.filter((e: any) => e.status === 'new').length : 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Care homes interested in our staffing services</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Follow-up Required</span>
                            <Badge variant="secondary">
                              {Array.isArray(enquiries) ? enquiries.filter((e: any) => e.status === 'contacted').length : 0}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Enquiries requiring additional follow-up</p>
                        </div>
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={() => setShowCreateManagerDialog(true)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Care Home Manager Account
                        </Button>
                      </div>
                    </div>

                    {/* Recent Enquiries List */}
                    {Array.isArray(enquiries) && enquiries.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-4">Recent Enquiries</h4>
                        <div className="space-y-4">
                          {enquiries.slice(0, 5).map((enquiry: any) => (
                            <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-lg">{enquiry.care_home_name || enquiry.facilityName}</h3>
                                        <Badge className={`px-2 py-1 text-xs font-medium ${
                                          enquiry.care_setting_type === 'residential' ? 'bg-blue-100 text-blue-800' :
                                          enquiry.care_setting_type === 'nursing' ? 'bg-green-100 text-green-800' :
                                          enquiry.care_setting_type === 'domiciliary' ? 'bg-purple-100 text-purple-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {enquiry.care_setting_type ? enquiry.care_setting_type.charAt(0).toUpperCase() + enquiry.care_setting_type.slice(1) : 'General'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">{enquiry.manager_name || enquiry.contactName} • {enquiry.email}</p>
                                      <p className="text-sm text-gray-500">{enquiry.location} • {enquiry.contact_phone}</p>
                                      
                                      {/* Care Type Specific Details */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                                        <div>
                                          <span className="font-medium">
                                            {enquiry.care_setting_type === 'domiciliary' ? 'Client Capacity:' : 'Beds:'} 
                                          </span> {enquiry.facility_capacity || enquiry.numberOfBeds}
                                        </div>
                                        {enquiry.cqc_registration_number && (
                                          <div>
                                            <span className="font-medium">CQC:</span> {enquiry.cqc_registration_number}
                                          </div>
                                        )}
                                        {enquiry.specializations && enquiry.specializations.length > 0 && (
                                          <div className="col-span-2">
                                            <span className="font-medium">Specializations:</span> {enquiry.specializations.slice(0, 3).join(', ')}
                                            {enquiry.specializations.length > 3 && ` +${enquiry.specializations.length - 3} more`}
                                          </div>
                                        )}
                                        {enquiry.services_offered && enquiry.services_offered.length > 0 && (
                                          <div className="col-span-2">
                                            <span className="font-medium">Services:</span> {enquiry.services_offered.slice(0, 3).join(', ')}
                                            {enquiry.services_offered.length > 3 && ` +${enquiry.services_offered.length - 3} more`}
                                          </div>
                                        )}
                                        {enquiry.urgent_staffing_needs && (
                                          <div className="col-span-2">
                                            <span className="font-medium text-red-600">Urgent Needs:</span> {enquiry.urgent_staffing_needs}
                                          </div>
                                        )}
                                        {enquiry.promotion_source && (
                                          <div className="col-span-2">
                                            <span className="font-medium text-green-600">Source:</span> {enquiry.promotion_source}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      <Badge variant="outline" className={`${
                                        enquiry.status === 'new' ? 'bg-blue-50 text-blue-700' :
                                        enquiry.status === 'contacted' ? 'bg-yellow-50 text-yellow-700' :
                                        enquiry.status === 'in_progress' ? 'bg-orange-50 text-orange-700' :
                                        enquiry.status === 'approved' ? 'bg-green-50 text-green-700' :
                                        'bg-gray-50 text-gray-700'
                                      }`}>
                                        {enquiry.status === 'new' ? 'New' :
                                         enquiry.status === 'contacted' ? 'Contacted' :
                                         enquiry.status === 'in_progress' ? 'In Progress' :
                                         enquiry.status === 'approved' ? 'Approved' :
                                         enquiry.status}
                                      </Badge>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" title="View Details">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" title="Contact">
                                          <Phone className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Service Features */}
                                  {(enquiry.meal_services || enquiry.transport_provided || enquiry.emergency_response || 
                                    enquiry.local_authority_contracts || enquiry.private_pay_clients) && (
                                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                                      {enquiry.meal_services && <Badge variant="secondary" className="text-xs">Meals</Badge>}
                                      {enquiry.transport_provided && <Badge variant="secondary" className="text-xs">Transport</Badge>}
                                      {enquiry.emergency_response && <Badge variant="secondary" className="text-xs">24/7 Response</Badge>}
                                      {enquiry.local_authority_contracts && <Badge variant="secondary" className="text-xs">LA Contracts</Badge>}
                                      {enquiry.private_pay_clients && <Badge variant="secondary" className="text-xs">Private Pay</Badge>}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* KPI Dashboard Tab */}
              <TabsContent value="kpi" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Shift Fulfillment KPI Dashboard
                    </CardTitle>
                    <CardDescription>
                      Monitor shift fulfillment rates and track unfulfilled shifts for performance analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ShiftKPIDashboard />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <AdminNotificationCenter 
                  onNavigateToTab={(tabName) => setActiveTab(tabName)}
                />
              </TabsContent>

              {/* Business Support Management Tab */}
              <TabsContent value="business-support" className="space-y-6">
                <BusinessSupportUserManager 
                  onCreateUser={() => setShowCreateBusinessSupportDialog(true)}
                />
              </TabsContent>

              {/* Comprehensive Feedback Management Tab */}
              <TabsContent value="feedback" className="space-y-6">
                <div className="grid gap-6">
                  {/* Feedback Overview Cards */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {Array.isArray(feedbackData) ? feedbackData.length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Feedback submissions received
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Response</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {Array.isArray(feedbackData) ? feedbackData.filter((f: any) => !f.adminResponse).length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Awaiting admin response
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Responded</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {Array.isArray(feedbackData) ? feedbackData.filter((f: any) => f.adminResponse).length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Responses sent
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <Award className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {Array.isArray(feedbackData) && feedbackData.length > 0 
                            ? (feedbackData.reduce((acc: number, f: any) => acc + (f.rating || 0), 0) / feedbackData.length).toFixed(1)
                            : '0.0'
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Out of 5 stars
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feedback Management Interface */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Staff Feedback Management
                      </CardTitle>
                      <CardDescription>
                        Monitor and respond to feedback from care home managers about staff performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Filters and Search */}
                      <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                          <Input
                            placeholder="Search by staff name, care home, or feedback content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Feedback</SelectItem>
                            <SelectItem value="pending">Pending Response</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Feedback List */}
                      <div className="space-y-4">
                        {Array.isArray(feedbackData) && feedbackData
                          .filter((feedback: any) => {
                            const matchesSearch = !searchTerm || 
                              feedback.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              feedback.careHomeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              feedback.feedback?.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesStatus = filterStatus === 'all' || 
                              (filterStatus === 'pending' && !feedback.adminResponse) ||
                              (filterStatus === 'responded' && feedback.adminResponse);
                            return matchesSearch && matchesStatus;
                          })
                          .map((feedback: any) => (
                            <Card key={feedback.id} className="p-4">
                              <div className="space-y-4">
                                {/* Feedback Header */}
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold">{feedback.staffName}</h3>
                                      <Badge variant="outline">{feedback.role}</Badge>
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Award
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < (feedback.rating || 0)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {feedback.careHomeName} • {feedback.shiftRef} • {new Date(feedback.shiftDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge variant={feedback.adminResponse ? "default" : "secondary"}>
                                    {feedback.adminResponse ? "Responded" : "Pending"}
                                  </Badge>
                                </div>

                                {/* Original Feedback */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-sm font-medium mb-2">Care Home Manager Feedback:</h4>
                                  <p className="text-sm">{feedback.feedback}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Submitted by {feedback.managerName} on {new Date(feedback.createdAt).toLocaleDateString()}
                                  </p>
                                </div>

                                {/* Admin Response */}
                                {feedback.adminResponse ? (
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <h4 className="text-sm font-medium mb-2">Business Support Response:</h4>
                                    <p className="text-sm">{feedback.adminResponse}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-muted-foreground">
                                        Responded by {feedback.respondedBy} on {new Date(feedback.responseDate).toLocaleDateString()}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            // Edit response functionality
                                            setSelectedFeedback(feedback);
                                            setShowFeedbackResponseDialog(true);
                                          }}
                                        >
                                          <Edit className="h-3 w-3 mr-1" />
                                          Edit Response
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">No response provided yet</p>
                                    <Button
                                      onClick={() => {
                                        setSelectedFeedback(feedback);
                                        setShowFeedbackResponseDialog(true);
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      Respond to Feedback
                                    </Button>
                                  </div>
                                )}

                                {/* Response Tracking */}
                                <div className="pt-3 border-t">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        Care Home Notified: {feedback.careHomeNotified ? 'Yes' : 'No'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Staff Notified: {feedback.staffNotified ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        // View full conversation history
                                        setSelectedFeedback(feedback);
                                        setShowFeedbackHistoryDialog(true);
                                      }}
                                    >
                                      View History
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}

                        {Array.isArray(feedbackData) && feedbackData.length === 0 && (
                          <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No feedback submissions yet</h3>
                            <p className="text-muted-foreground">
                              Feedback from care home managers will appear here once shifts are completed.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Self-Billing & Invoicing Tab */}
              <TabsContent value="self-billing" className="space-y-4">
                <SelfBillingInvoiceEngine />
              </TabsContent>

              <TabsContent value="map-view" className="space-y-4">
                <UKMapView />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <CreateCareHomeManagerDialog 
        open={showCreateManagerDialog} 
        onOpenChange={setShowCreateManagerDialog} 
      />
      <CreateBusinessSupportDialog 
        open={showCreateBusinessSupportDialog} 
        onOpenChange={setShowCreateBusinessSupportDialog} 
      />
      <ChangePasswordDialog 
        open={showChangePasswordDialog} 
        onOpenChange={setShowChangePasswordDialog} 
      />
      <CreateCareHomeDialog 
        open={showCreateCareHomeDialog} 
        onOpenChange={setShowCreateCareHomeDialog} 
      />
      <EditCareHomeDialog 
        open={showEditCareHomeDialog} 
        onOpenChange={setShowEditCareHomeDialog}
        careHome={selectedCareHome}
      />

      {/* Feedback Response Dialog */}
      <Dialog open={showFeedbackResponseDialog} onOpenChange={setShowFeedbackResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedFeedback?.adminResponse ? "Edit Response" : "Respond to Feedback"}
            </DialogTitle>
            <DialogDescription>
              {selectedFeedback && (
                <div className="space-y-2">
                  <p>Staff: <strong>{selectedFeedback.staffName}</strong></p>
                  <p>Care Home: <strong>{selectedFeedback.careHomeName}</strong></p>
                  <p>Shift: <strong>{selectedFeedback.shiftRef}</strong> on {new Date(selectedFeedback.shiftDate).toLocaleDateString()}</p>
                  <div className="flex items-center gap-2">
                    <span>Rating:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Award
                          key={i}
                          className={`h-4 w-4 ${
                            i < (selectedFeedback.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Original Feedback */}
            {selectedFeedback && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Care Home Manager Feedback:</h4>
                <p className="text-sm">{selectedFeedback.feedback}</p>
              </div>
            )}
            
            {/* Response Form */}
            <div className="space-y-2">
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Enter your response to the care home manager..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                This response will be sent to the care home manager and visible to staff.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowFeedbackResponseDialog(false);
                setSelectedFeedback(null);
                setResponseText("");
              }}
              disabled={isSubmittingResponse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={isSubmittingResponse || !responseText.trim()}
            >
              {isSubmittingResponse ? "Submitting..." : (selectedFeedback?.adminResponse ? "Update Response" : "Submit Response")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Card Edit Dialog */}
      {selectedRateCard && (
        <Dialog open={showRateCardDialog} onOpenChange={setShowRateCardDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Edit Rate Card - {selectedRateCard.role}
              </DialogTitle>
              <DialogDescription>
                Update pricing and multipliers for {selectedRateCard.shiftType} {selectedRateCard.dayType} shifts
              </DialogDescription>
            </DialogHeader>
            
            <RateCardEditForm 
              rateCard={selectedRateCard}
              onSave={(updatedData) => updateRateCardMutation.mutate(updatedData)}
              onCancel={() => {
                setShowRateCardDialog(false);
                setSelectedRateCard(null);
              }}
              isLoading={updateRateCardMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Rate Card Edit Form Component
function RateCardEditForm({ rateCard, onSave, onCancel, isLoading }: {
  rateCard: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    id: rateCard.id,
    role: rateCard.role,
    dayType: rateCard.dayType,
    shiftType: rateCard.shiftType,
    internalHourlyRate: rateCard.internalHourlyRate || 0,
    externalHourlyRate: rateCard.externalHourlyRate || 0,
    overtimeMultiplier: rateCard.overtimeMultiplier || 1.5,
    nightShiftMultiplier: rateCard.nightShiftMultiplier || 1.2,
    weekendMultiplier: rateCard.weekendMultiplier || 1.3,
    bankHolidayMultiplier: rateCard.bankHolidayMultiplier || 1.8,
    isActive: rateCard.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="role">Job Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            disabled
            className="bg-gray-50"
          />
        </div>
        <div>
          <Label htmlFor="type">Shift Type</Label>
          <Input
            id="type"
            value={`${formData.shiftType} ${formData.dayType}`}
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Hourly Rates Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Hourly Rates</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="internalRate">Internal Rate (£/hour)</Label>
            <Input
              id="internalRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.internalHourlyRate}
              onChange={(e) => handleChange('internalHourlyRate', parseFloat(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">Amount paid to staff</p>
          </div>
          <div>
            <Label htmlFor="externalRate">External Rate (£/hour)</Label>
            <Input
              id="externalRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.externalHourlyRate}
              onChange={(e) => handleChange('externalHourlyRate', parseFloat(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">Amount charged to care home</p>
          </div>
        </div>
      </div>

      {/* Multipliers Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Rate Multipliers</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="overtimeMultiplier">Overtime Multiplier</Label>
            <Input
              id="overtimeMultiplier"
              type="number"
              step="0.1"
              min="1"
              max="3"
              value={formData.overtimeMultiplier}
              onChange={(e) => handleChange('overtimeMultiplier', parseFloat(e.target.value) || 1.5)}
            />
          </div>
          <div>
            <Label htmlFor="nightShiftMultiplier">Night Shift Multiplier</Label>
            <Input
              id="nightShiftMultiplier"
              type="number"
              step="0.1"
              min="1"
              max="2"
              value={formData.nightShiftMultiplier}
              onChange={(e) => handleChange('nightShiftMultiplier', parseFloat(e.target.value) || 1.2)}
            />
          </div>
          <div>
            <Label htmlFor="weekendMultiplier">Weekend Multiplier</Label>
            <Input
              id="weekendMultiplier"
              type="number"
              step="0.1"
              min="1"
              max="2"
              value={formData.weekendMultiplier}
              onChange={(e) => handleChange('weekendMultiplier', parseFloat(e.target.value) || 1.3)}
            />
          </div>
          <div>
            <Label htmlFor="bankHolidayMultiplier">Bank Holiday Multiplier</Label>
            <Input
              id="bankHolidayMultiplier"
              type="number"
              step="0.1"
              min="1"
              max="3"
              value={formData.bankHolidayMultiplier}
              onChange={(e) => handleChange('bankHolidayMultiplier', parseFloat(e.target.value) || 1.8)}
            />
          </div>
        </div>
      </div>

      {/* Rate Calculations Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Rate Calculations Preview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Standard:</strong> £{formData.internalHourlyRate.toFixed(2)} / £{formData.externalHourlyRate.toFixed(2)}</p>
            <p><strong>Overtime:</strong> £{(formData.internalHourlyRate * formData.overtimeMultiplier).toFixed(2)} / £{(formData.externalHourlyRate * formData.overtimeMultiplier).toFixed(2)}</p>
          </div>
          <div>
            <p><strong>Night Shift:</strong> £{(formData.internalHourlyRate * formData.nightShiftMultiplier).toFixed(2)} / £{(formData.externalHourlyRate * formData.nightShiftMultiplier).toFixed(2)}</p>
            <p><strong>Bank Holiday:</strong> £{(formData.internalHourlyRate * formData.bankHolidayMultiplier).toFixed(2)} / £{(formData.externalHourlyRate * formData.bankHolidayMultiplier).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Expanded Rate Card Component with inline editing
function ExpandedRateCard({ rateCard, onUpdate, isLoading }: {
  rateCard: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: rateCard.id,
    role: rateCard.role,
    dayType: rateCard.dayType,
    shiftType: rateCard.shiftType,
    internalHourlyRate: rateCard.internalHourlyRate || 0,
    externalHourlyRate: rateCard.externalHourlyRate || 0,
    overtimeMultiplier: rateCard.overtimeMultiplier || 1.5,
    nightShiftMultiplier: rateCard.nightShiftMultiplier || 1.2,
    weekendMultiplier: rateCard.weekendMultiplier || 1.3,
    bankHolidayMultiplier: rateCard.bankHolidayMultiplier || 1.8,
    isActive: rateCard.isActive ?? true
  });

  // Reset form data when rateCard changes
  useEffect(() => {
    setFormData({
      id: rateCard.id,
      role: rateCard.role,
      dayType: rateCard.dayType,
      shiftType: rateCard.shiftType,
      internalHourlyRate: rateCard.internalHourlyRate || 0,
      externalHourlyRate: rateCard.externalHourlyRate || 0,
      overtimeMultiplier: rateCard.overtimeMultiplier || 1.5,
      nightShiftMultiplier: rateCard.nightShiftMultiplier || 1.2,
      weekendMultiplier: rateCard.weekendMultiplier || 1.3,
      bankHolidayMultiplier: rateCard.bankHolidayMultiplier || 1.8,
      isActive: rateCard.isActive ?? true
    });
  }, [rateCard]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
      toast({
        title: "Rate Card Updated",
        description: "Rate card has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed", 
        description: "Failed to update rate card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      id: rateCard.id,
      role: rateCard.role,
      dayType: rateCard.dayType,
      shiftType: rateCard.shiftType,
      internalHourlyRate: rateCard.internalHourlyRate || 0,
      externalHourlyRate: rateCard.externalHourlyRate || 0,
      overtimeMultiplier: rateCard.overtimeMultiplier || 1.5,
      nightShiftMultiplier: rateCard.nightShiftMultiplier || 1.2,
      weekendMultiplier: rateCard.weekendMultiplier || 1.3,
      bankHolidayMultiplier: rateCard.bankHolidayMultiplier || 1.8,
      isActive: rateCard.isActive ?? true
    });
    setIsEditing(false);
  };

  const formatRoleName = (role: string) => {
    return role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || role;
  };

  const getBadgeColor = (dayType: string, shiftType: string) => {
    if (dayType === 'weekend' && shiftType === 'night') return 'bg-red-100 text-red-800';
    if (dayType === 'weekend') return 'bg-orange-100 text-orange-800';
    if (shiftType === 'night') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {formatRoleName(formData.role)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                className={`${getBadgeColor(formData.dayType, formData.shiftType)} border-0`}
              >
                {formData.shiftType} {formData.dayType}
              </Badge>
              <Badge variant={formData.isActive ? "default" : "secondary"}>
                {formData.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckSquare className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Hourly Rates Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 border-b pb-2">Base Hourly Rates</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`internal-${rateCard.id}`} className="text-sm font-medium">
                Internal Rate
              </Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <Input
                    id={`internal-${rateCard.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.internalHourlyRate}
                    onChange={(e) => handleChange('internalHourlyRate', parseFloat(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  £{formData.internalHourlyRate}/hr
                </div>
              )}
            </div>
            <div>
              <Label htmlFor={`external-${rateCard.id}`} className="text-sm font-medium">
                External Rate
              </Label>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <Input
                    id={`external-${rateCard.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.externalHourlyRate}
                    onChange={(e) => handleChange('externalHourlyRate', parseFloat(e.target.value) || 0)}
                    className="pl-7"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  £{formData.externalHourlyRate}/hr
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rate Multipliers Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 border-b pb-2">Rate Multipliers</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor={`overtime-${rateCard.id}`} className="text-sm font-medium">
                  Overtime Multiplier
                </Label>
                {isEditing ? (
                  <Input
                    id={`overtime-${rateCard.id}`}
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.overtimeMultiplier}
                    onChange={(e) => handleChange('overtimeMultiplier', parseFloat(e.target.value) || 1.5)}
                  />
                ) : (
                  <div className="text-lg font-semibold text-orange-600">
                    {formData.overtimeMultiplier}x
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor={`night-${rateCard.id}`} className="text-sm font-medium">
                  Night Shift Multiplier
                </Label>
                {isEditing ? (
                  <Input
                    id={`night-${rateCard.id}`}
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.nightShiftMultiplier}
                    onChange={(e) => handleChange('nightShiftMultiplier', parseFloat(e.target.value) || 1.2)}
                  />
                ) : (
                  <div className="text-lg font-semibold text-indigo-600">
                    {formData.nightShiftMultiplier}x
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor={`weekend-${rateCard.id}`} className="text-sm font-medium">
                  Weekend Multiplier
                </Label>
                {isEditing ? (
                  <Input
                    id={`weekend-${rateCard.id}`}
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.weekendMultiplier}
                    onChange={(e) => handleChange('weekendMultiplier', parseFloat(e.target.value) || 1.3)}
                  />
                ) : (
                  <div className="text-lg font-semibold text-purple-600">
                    {formData.weekendMultiplier}x
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor={`holiday-${rateCard.id}`} className="text-sm font-medium">
                  Bank Holiday Multiplier
                </Label>
                {isEditing ? (
                  <Input
                    id={`holiday-${rateCard.id}`}
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.bankHolidayMultiplier}
                    onChange={(e) => handleChange('bankHolidayMultiplier', parseFloat(e.target.value) || 1.8)}
                  />
                ) : (
                  <div className="text-lg font-semibold text-red-600">
                    {formData.bankHolidayMultiplier}x
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Examples Section */}
        {!isEditing && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">Rate Examples</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Standard Hour:</span>
                  <span className="font-medium">£{formData.externalHourlyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Hour:</span>
                  <span className="font-medium">£{(formData.externalHourlyRate * formData.overtimeMultiplier).toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Weekend Hour:</span>
                  <span className="font-medium">£{(formData.externalHourlyRate * formData.weekendMultiplier).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bank Holiday Hour:</span>
                  <span className="font-medium">£{(formData.externalHourlyRate * formData.bankHolidayMultiplier).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status and Meta Information */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>ID: {rateCard.id}</span>
            <span>Updated: {new Date(rateCard.updatedAt || rateCard.effectiveFrom).toLocaleDateString()}</span>
          </div>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`active-${rateCard.id}`}
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
              <Label htmlFor={`active-${rateCard.id}`} className="text-sm">
                Active
              </Label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCareHomeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postcode: '',
    main_phone: '',
    primary_contact_name: '',
    facility_type: 'Residential Home',
    cqc_rating: 'Good',
    email_address: '',
    group_affiliation: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiRequest('/api/care-homes', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      toast({
        title: "Success",
        description: "Care facility created successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/care-homes'] });
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        city: '',
        postcode: '',
        main_phone: '',
        primary_contact_name: '',
        facility_type: 'Residential Home',
        cqc_rating: 'Good',
        email_address: '',
        group_affiliation: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create care facility",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Care Facility</DialogTitle>
          <DialogDescription>
            Create a new care facility in the system
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Facility Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Sunshine Care Home"
                required
              />
            </div>
            <div>
              <Label htmlFor="facility_type">Facility Type</Label>
              <Select value={formData.facility_type} onValueChange={(value) => setFormData(prev => ({ ...prev, facility_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Residential Home">Residential Home</SelectItem>
                  <SelectItem value="Nursing Home">Nursing Home</SelectItem>
                  <SelectItem value="Domiciliary Care">Domiciliary Care</SelectItem>
                  <SelectItem value="Respite Care">Respite Care</SelectItem>
                  <SelectItem value="Day Care">Day Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address"
                required
              />
            </div>
            <div>
              <Label htmlFor="city">Town/City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="e.g., London"
              />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                placeholder="e.g., SW1A 1AA"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="main_phone">Main Phone *</Label>
              <Input
                id="main_phone"
                value={formData.main_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, main_phone: e.target.value }))}
                placeholder="e.g., +44 20 7946 0958"
                required
              />
            </div>
            <div>
              <Label htmlFor="email_address">Email Address</Label>
              <Input
                id="email_address"
                type="email"
                value={formData.email_address}
                onChange={(e) => setFormData(prev => ({ ...prev, email_address: e.target.value }))}
                placeholder="facility@example.com"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_contact_name">Primary Contact *</Label>
              <Input
                id="primary_contact_name"
                value={formData.primary_contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_contact_name: e.target.value }))}
                placeholder="Contact person name"
                required
              />
            </div>
            <div>
              <Label htmlFor="cqc_rating">CQC Rating</Label>
              <Select value={formData.cqc_rating} onValueChange={(value) => setFormData(prev => ({ ...prev, cqc_rating: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outstanding">Outstanding</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Requires Improvement">Requires Improvement</SelectItem>
                  <SelectItem value="Inadequate">Inadequate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="group_affiliation">Group Affiliation</Label>
            <Input
              id="group_affiliation"
              value={formData.group_affiliation}
              onChange={(e) => setFormData(prev => ({ ...prev, group_affiliation: e.target.value }))}
              placeholder="Care home group (if applicable)"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Care Facility"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCareHomeDialog({ 
  open, 
  onOpenChange, 
  careHome 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  careHome: any;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    care_setting_type: "residential_home",
    address: "",
    city: "",
    postcode: "",
    phone: "",
    email: "",
    capacity: "",
    cqc_rating: "",
    cqc_registration_number: "",
    manager_name: "",
    manager_phone: "",
    manager_email: "",
    deputy_manager_name: "",
    deputy_manager_phone: "",
    night_manager_name: "",
    night_manager_phone: "",
    specializations: [] as string[],
    services_offered: [] as string[],
    medical_conditions: [] as string[],
    equipment_available: [] as string[],
    age_groups_accepted: [] as string[],
    service_areas: [] as string[],
    contract_status: "pending",
    contract_start_date: "",
    contract_end_date: "",
    hourly_rate_standard: "",
    hourly_rate_premium: "",
    billing_contact_name: "",
    billing_contact_email: "",
    billing_contact_phone: "",
    payment_terms: "",
    invoice_frequency: "",
    purchase_order_required: false,
    emergency_contact_name: "",
    emergency_contact_phone: "",
    out_of_hours_contact: "",
    safeguarding_lead_name: "",
    safeguarding_lead_phone: "",
    operational_hours: {},
    meals_provided: false,
    transport_available: false,
    emergency_response_24_7: false,
    respite_care: false,
    end_of_life_care: false,
    dementia_specialist: false,
    learning_disabilities: false,
    mental_health_support: false,
    physical_disabilities: false,
    short_term_stays: false,
    long_term_residents: false,
    day_care_services: false
  });

  // Reset form data when careHome changes
  useEffect(() => {
    if (careHome) {
      setFormData({
        name: careHome.name || "",
        care_setting_type: careHome.care_setting_type || "residential_home",
        address: careHome.address || "",
        city: careHome.city || "",
        postcode: careHome.postcode || "",
        phone: careHome.phone || "",
        email: careHome.email || "",
        capacity: careHome.capacity?.toString() || "",
        cqc_rating: careHome.cqc_rating || "",
        cqc_registration_number: careHome.cqc_registration_number || "",
        manager_name: careHome.manager_name || "",
        manager_phone: careHome.manager_phone || "",
        manager_email: careHome.manager_email || "",
        deputy_manager_name: careHome.deputy_manager_name || "",
        deputy_manager_phone: careHome.deputy_manager_phone || "",
        night_manager_name: careHome.night_manager_name || "",
        night_manager_phone: careHome.night_manager_phone || "",
        specializations: careHome.specializations || [],
        services_offered: careHome.services_offered || [],
        medical_conditions: careHome.medical_conditions || [],
        equipment_available: careHome.equipment_available || [],
        age_groups_accepted: careHome.age_groups_accepted || [],
        service_areas: careHome.service_areas || [],
        contract_status: careHome.contract_status || "pending",
        contract_start_date: careHome.contract_start_date || "",
        contract_end_date: careHome.contract_end_date || "",
        hourly_rate_standard: careHome.hourly_rate_standard?.toString() || "",
        hourly_rate_premium: careHome.hourly_rate_premium?.toString() || "",
        billing_contact_name: careHome.billing_contact_name || "",
        billing_contact_email: careHome.billing_contact_email || "",
        billing_contact_phone: careHome.billing_contact_phone || "",
        payment_terms: careHome.payment_terms || "",
        invoice_frequency: careHome.invoice_frequency || "",
        purchase_order_required: careHome.purchase_order_required || false,
        emergency_contact_name: careHome.emergency_contact_name || "",
        emergency_contact_phone: careHome.emergency_contact_phone || "",
        out_of_hours_contact: careHome.out_of_hours_contact || "",
        safeguarding_lead_name: careHome.safeguarding_lead_name || "",
        safeguarding_lead_phone: careHome.safeguarding_lead_phone || "",
        operational_hours: careHome.operational_hours || {},
        meals_provided: careHome.meals_provided || false,
        transport_available: careHome.transport_available || false,
        emergency_response_24_7: careHome.emergency_response_24_7 || false,
        respite_care: careHome.respite_care || false,
        end_of_life_care: careHome.end_of_life_care || false,
        dementia_specialist: careHome.dementia_specialist || false,
        learning_disabilities: careHome.learning_disabilities || false,
        mental_health_support: careHome.mental_health_support || false,
        physical_disabilities: careHome.physical_disabilities || false,
        short_term_stays: careHome.short_term_stays || false,
        long_term_residents: careHome.long_term_residents || false,
        day_care_services: careHome.day_care_services || false
      });
      setIsEditing(false);
    }
  }, [careHome]);

  const specializationOptions = [
    "Dementia Care", "End of Life Care", "Learning Disabilities", 
    "Mental Health", "Physical Disabilities", "Respite Care",
    "Young Adults (18-65)", "Elderly Care"
  ];

  const servicesOptions = [
    "Personal Care", "Nursing Care", "Medication Management",
    "Physiotherapy", "Occupational Therapy", "Social Activities",
    "Meal Preparation", "Laundry Services", "Transportation"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const fieldValue = prev[field as keyof typeof prev];
      const isArray = Array.isArray(fieldValue);
      const currentArray = isArray ? fieldValue as string[] : [];
      
      return {
        ...prev,
        [field]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careHome?.id) return;
    
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        hourly_rate_standard: formData.hourly_rate_standard ? parseFloat(formData.hourly_rate_standard) : null,
        hourly_rate_premium: formData.hourly_rate_premium ? parseFloat(formData.hourly_rate_premium) : null,
      };

      const response = await fetch(`/api/admin/care-homes/${careHome.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update care facility');
      }

      toast({
        title: "Success",
        description: "Care facility updated successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['/api/admin/care-homes'] });
      onOpenChange(false);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update care facility",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!careHome) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? 'Edit' : 'View'} Care Facility: {careHome.name}</span>
            <div className="flex gap-2">
              {!isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              )}
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edit the care facility details below' : 'View care facility information and click Edit Details to make changes'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Facility Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="care_setting_type">Care Setting Type</Label>
                <Select
                  value={formData.care_setting_type}
                  onValueChange={(value) => handleInputChange('care_setting_type', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className={isEditing ? '' : 'bg-gray-50'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential_home">Residential Care Home</SelectItem>
                    <SelectItem value="nursing_home">Nursing Home</SelectItem>
                    <SelectItem value="domiciliary_care">Domiciliary Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity ({formData.care_setting_type === 'domiciliary_care' ? 'Clients' : 'Beds'})</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="cqc_rating">CQC Rating</Label>
                <Select
                  value={formData.cqc_rating}
                  onValueChange={(value) => handleInputChange('cqc_rating', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className={isEditing ? '' : 'bg-gray-50'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outstanding">Outstanding</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Requires Improvement">Requires Improvement</SelectItem>
                    <SelectItem value="Inadequate">Inadequate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="city">Town/City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                {/* Empty space for grid alignment */}
              </div>
            </div>
          </div>

          {/* Specializations (if applicable) */}
          {(formData.care_setting_type === 'residential_home' || formData.care_setting_type === 'nursing_home') && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specializations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {specializationOptions.map((spec) => (
                  <div key={spec} className="flex items-center space-x-2">
                    <Checkbox
                      id={`spec-${spec}`}
                      checked={formData.specializations.includes(spec)}
                      onCheckedChange={() => handleArrayToggle('specializations', spec)}
                      disabled={!isEditing}
                    />
                    <Label htmlFor={`spec-${spec}`} className="text-sm">{spec}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Services Offered</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {servicesOptions.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={formData.services_offered.includes(service)}
                    onCheckedChange={() => handleArrayToggle('services_offered', service)}
                    disabled={!isEditing}
                  />
                  <Label htmlFor={`service-${service}`} className="text-sm">{service}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Management Team */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Management Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager_name">Manager Name</Label>
                <Input
                  id="manager_name"
                  value={formData.manager_name}
                  onChange={(e) => handleInputChange('manager_name', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="manager_phone">Manager Phone</Label>
                <Input
                  id="manager_phone"
                  value={formData.manager_phone}
                  onChange={(e) => handleInputChange('manager_phone', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
              <div>
                <Label htmlFor="manager_email">Manager Email</Label>
                <Input
                  id="manager_email"
                  type="email"
                  value={formData.manager_email}
                  onChange={(e) => handleInputChange('manager_email', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
            </div>
          </div>

          {/* Contract Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contract Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract_status">Contract Status</Label>
                <Select
                  value={formData.contract_status}
                  onValueChange={(value) => handleInputChange('contract_status', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className={isEditing ? '' : 'bg-gray-50'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cqc_registration_number">CQC Registration Number</Label>
                <Input
                  id="cqc_registration_number"
                  value={formData.cqc_registration_number}
                  onChange={(e) => handleInputChange('cqc_registration_number', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? '' : 'bg-gray-50'}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          )}

          {!isEditing && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}