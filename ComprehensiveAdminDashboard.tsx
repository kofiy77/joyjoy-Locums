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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  Users, Building2, Calendar, FileText, Shield, UserPlus, MessageCircle,
  Clock, CheckCircle, XCircle, Edit, Trash2, Eye, Award, AlertTriangle, LogOut,
  Search, MapPin, MoreHorizontal, Mail, Download, Plus, DollarSign,
  Phone, Home, Filter, Upload, Settings, TrendingUp, Activity, Lock
} from "lucide-react";
import { CreateCareHomeManagerDialog } from "@/components/CreateCareHomeManagerDialog";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import ComprehensiveDocumentManagement from "@/components/ComprehensiveDocumentManagement";

export default function ComprehensiveAdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateManagerDialog, setShowCreateManagerDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showRateCardDialog, setShowRateCardDialog] = useState(false);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);
  const [showDocumentEditDialog, setShowDocumentEditDialog] = useState(false);
  
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

  // Comprehensive data queries
  const { data: users = [] } = useQuery({ queryKey: ['/api/admin/users'] });
  const { data: careHomes = [] } = useQuery({ queryKey: ['/api/admin/care-homes'] });
  const { data: shifts = [] } = useQuery({ queryKey: ['/api/shifts'] });
  const { data: certifications = [] } = useQuery({ queryKey: ['/api/admin/certifications'] });
  const { data: documents = [] } = useQuery({ queryKey: ['/api/admin/documents'] });
  const { data: rateCards = [] } = useQuery({ queryKey: ['/api/admin/rate-cards'] });
  const { data: enquiries = [] } = useQuery({ queryKey: ['/api/admin/care-home-enquiries'] });
  const { data: auditLogs = [] } = useQuery({ queryKey: ['/api/admin/audit-logs'] });
  const { data: smsMessages = [] } = useQuery({ queryKey: ['/api/admin/sms-messages'] });
  const { data: dashboardStats = {} } = useQuery({ queryKey: ['/api/admin/dashboard-stats'] });

  // Comprehensive mutations
  const verifyCertificationMutation = useMutation({
    mutationFn: async ({ certId, action, notes }: any) => apiRequest(`/api/admin/certifications/${certId}/verify`, {
      method: 'POST',
      body: { action, notes }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications'] });
      toast({ title: "Certification updated successfully" });
    }
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ docId, action, notes }: any) => apiRequest(`/api/admin/documents/${docId}/verify`, {
      method: 'POST',
      body: { action, notes }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({ title: "Document updated successfully" });
    }
  });

  const updateRateCardMutation = useMutation({
    mutationFn: async (rateCardData: any) => apiRequest(`/api/admin/rate-cards/${rateCardData.id}`, {
      method: 'PUT',
      body: rateCardData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/rate-cards'] });
      toast({ title: "Rate card updated successfully" });
      setShowRateCardDialog(false);
    }
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
      cert.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificationType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterCertStatus === 'all' || cert.status === filterCertStatus;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Top Navigation Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 hidden md:block">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">JoyJoy Care Admin Portal</h1>
              <p className="text-sm text-gray-500">Comprehensive System Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge className="bg-red-100 text-red-800 text-xs">
                Admin Access
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePasswordDialog(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Change Password
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
        {/* Vertical Sidebar Navigation */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-6 bg-white overflow-y-auto border-r border-gray-200">
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`${
                  activeTab === "overview"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <Home className={`${
                  activeTab === "overview" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`${
                  activeTab === "users"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <Users className={`${
                  activeTab === "users" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Users</span>
              </button>

              <button
                onClick={() => setActiveTab("care-homes")}
                className={`${
                  activeTab === "care-homes"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <Building2 className={`${
                  activeTab === "care-homes" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Care Homes</span>
              </button>

              <button
                onClick={() => setActiveTab("shifts")}
                className={`${
                  activeTab === "shifts"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <Calendar className={`${
                  activeTab === "shifts" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Shifts</span>
              </button>

              <button
                onClick={() => setActiveTab("certifications")}
                className={`${
                  activeTab === "certifications"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <Award className={`${
                  activeTab === "certifications" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Certifications</span>
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className={`${
                  activeTab === "documents"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <FileText className={`${
                  activeTab === "documents" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Documents</span>
              </button>

              <button
                onClick={() => setActiveTab("rate-cards")}
                className={`${
                  activeTab === "rate-cards"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <DollarSign className={`${
                  activeTab === "rate-cards" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Rate Cards</span>
              </button>

              <button
                onClick={() => setActiveTab("onboarding")}
                className={`${
                  activeTab === "onboarding"
                    ? "bg-blue-100 text-blue-900 border-r-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors`}
              >
                <UserPlus className={`${
                  activeTab === "onboarding" ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                } flex-shrink-0 -ml-1 mr-3 h-6 w-6`} />
                <span className="truncate">Onboarding</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="m-4">
                <MoreHorizontal className="h-4 w-4" />
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
              <DropdownMenuItem onClick={() => setActiveTab("onboarding")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Onboarding
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

              {/* Enhanced Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Enhanced Statistics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Array.isArray(users) ? users.length : 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Staff: {Array.isArray(users) ? users.filter((u: any) => u.type === 'staff').length : 0} | 
                        Care Homes: {Array.isArray(users) ? users.filter((u: any) => u.type === 'care_home').length : 0}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Care Facilities</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Array.isArray(careHomes) ? careHomes.length : 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Active: {Array.isArray(careHomes) ? careHomes.filter((ch: any) => ch.contractStatus === 'active').length : 0} facilities
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Shift Analytics</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{Array.isArray(shifts) ? shifts.length : 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Open: {Array.isArray(shifts) ? shifts.filter((s: any) => s.status === 'open').length : 0} | 
                        Accepted: {Array.isArray(shifts) ? shifts.filter((s: any) => s.assignmentStatus === 'accepted').length : 0}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Array.isArray(certifications) ? certifications.filter((c: any) => c.status === 'valid').length : 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valid certifications | 
                        {Array.isArray(certifications) ? certifications.filter((c: any) => c.status === 'expiring').length : 0} expiring
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

              {/* Users Tab - Enhanced */}
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Comprehensive User Management & Compliance
                      <div className="flex items-center gap-2">
                        <Button onClick={() => setShowCreateManagerDialog(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Care Home Manager
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Advanced user management with compliance tracking, verification status, and detailed profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Search and Filter Controls */}
                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <Input
                          placeholder="Search by name, email, phone, or location..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-80"
                        />
                      </div>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="care_home">Care Home</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="business_support">Business Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge variant="outline">
                        {filteredUsers.length} of {Array.isArray(users) ? users.length : 0} users
                      </Badge>
                    </div>

                    {/* Enhanced User List */}
                    <div className="space-y-4">
                      {Array.isArray(filteredUsers) && filteredUsers.map((user: any) => (
                        <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                                  <p className="text-gray-600">{user.email}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{user.phone || 'No phone'}</span>
                                </div>
                                {user.postcode && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{user.postcode}</span>
                                  </div>
                                )}
                                {user.dateOfBirth && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">Born: {new Date(user.dateOfBirth).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>

                              {user.type === 'staff' && (
                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                  <h4 className="font-medium text-sm mb-2">Staff Compliance Dashboard</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <Badge variant="default" className="text-xs">
                                      <Shield className="h-3 w-3 mr-1" />
                                      DBS Valid
                                    </Badge>
                                    <Badge variant="default" className="text-xs">
                                      <Award className="h-3 w-3 mr-1" />
                                      RTW Valid
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      5 Certifications
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      3 Documents
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-start gap-2">
                              <div className="flex flex-col gap-2">
                                <Badge variant={
                                  user.type === 'admin' ? 'default' : 
                                  user.type === 'care_home' ? 'secondary' : 
                                  user.type === 'business_support' ? 'outline' :
                                  'secondary'
                                }>
                                  {user.type?.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserEditDialog(true);
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Full Profile
                                  </DropdownMenuItem>
                                  {user.type === 'staff' && (
                                    <>
                                      <DropdownMenuItem onClick={() => setActiveTab("certifications")}>
                                        <Award className="h-4 w-4 mr-2" />
                                        View Certifications
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setActiveTab("documents")}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Documents
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    {user.isActive ? 'Deactivate' : 'Activate'} User
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

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Management
                    </CardTitle>
                    <CardDescription>
                      Manage and review all platform documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComprehensiveDocumentManagement onRefresh={() => {}} />
                  </CardContent>
                </Card>
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
      <ChangePasswordDialog 
        open={showChangePasswordDialog} 
        onOpenChange={setShowChangePasswordDialog} 
      />
    </div>
  );
}