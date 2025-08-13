import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Building2, 
  Calendar, 
  Clock, 
  Settings, 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  FileText,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar as CalendarIcon,
  Star,
  Clock4,
  ChevronDown,
  Menu,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import joyJoyLogo from "../assets/joyjoy-logo.png";

// Schema for user operations
const editUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  postcode: z.string().min(5, "Postcode is required"),
  isActive: z.boolean()
});

// Schema for shift operations
const shiftUpdateSchema = z.object({
  status: z.enum(["open", "assigned", "accepted", "cancelled"]),
  notes: z.string().optional()
});

export default function BusinessSupportDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewProfileUser, setViewProfileUser] = useState<any>(null);

  // Debug state changes
  useEffect(() => {
    console.log('selectedUser state changed:', selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    console.log('viewProfileUser state changed:', viewProfileUser);
  }, [viewProfileUser]);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user permissions with error handling
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ['/api/business-support/permissions'],
    enabled: !!user && user.type === 'business_support',
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug permissions loading
  useEffect(() => {
    if (permissionsData) {
      console.log('Permissions loaded successfully for', user?.firstName, user?.lastName);
    }
    if (permissionsError) {
      console.error('Permissions error:', permissionsError);
    }
  }, [user, permissionsData, permissionsError]);

  // Fetch dashboard statistics
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/business-support/dashboard-stats'],
    enabled: activeTab === 'dashboard'
  });

  // Fetch all users for Users tab
  const { data: allUsers } = useQuery({
    queryKey: ['/api/business-support/users'],
    enabled: activeTab === 'users'
  });

  // Fetch all shifts for Shifts tab
  const { data: allShifts } = useQuery({
    queryKey: ['/api/business-support/shifts'],
    enabled: activeTab === 'shifts'
  });

  // Fetch care homes data
  const { data: careHomes } = useQuery({
    queryKey: ['/api/business-support/care-homes'],
    enabled: activeTab === 'care_homes'
  });

  // Fetch timesheets data
  const { data: timesheets, isLoading: timesheetsLoading, error: timesheetsError } = useQuery({
    queryKey: ['/api/business-support/timesheets'],
    enabled: activeTab === 'timesheets',
    retry: 3,
    staleTime: 0
  });

  // Debug timesheet loading
  useEffect(() => {
    if (timesheets && activeTab === 'timesheets') {
      console.log('Timesheets loaded:', timesheets?.length || 0, 'records');
    }
    if (timesheetsError) {
      console.error('Timesheets error:', timesheetsError);
    }
  }, [timesheets, timesheetsError, activeTab]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: any }) => {
      const response = await fetch(`/api/business-support/users/${data.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates)
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/business-support/users'] });
      setSelectedUser(null);
    }
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async (data: { shiftId: string; updates: any }) => {
      const response = await fetch(`/api/business-support/shifts/${data.shiftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates)
      });
      if (!response.ok) throw new Error('Failed to update shift');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Shift updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/business-support/shifts'] });
      setSelectedShift(null);
    }
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async (data: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/business-support/users/${data.userId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: data.isActive })
      });
      if (!response.ok) throw new Error('Failed to toggle user status');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/business-support/users'] });
    }
  });

  const handleToggleUserStatus = (user: any) => {
    const newStatus = !(user.isActive || user.is_active);
    toggleUserStatusMutation.mutate({
      userId: user.id,
      isActive: newStatus
    });
  };

  const editUserForm = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      postcode: "",
      isActive: true
    }
  });

  // Set form data when user is selected
  useEffect(() => {
    if (selectedUser) {
      editUserForm.reset({
        firstName: selectedUser.firstName || selectedUser.first_name || "",
        lastName: selectedUser.lastName || selectedUser.last_name || "",
        phone: selectedUser.phone || "",
        address: selectedUser.address || "",
        postcode: selectedUser.postcode || "",
        isActive: selectedUser.isActive ?? selectedUser.is_active ?? true
      });
    }
  }, [selectedUser, editUserForm]);

  const onUpdateUser = (data: any) => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      updates: data
    });
  };

  const onUpdateShift = (data: any) => {
    if (!selectedShift) return;
    updateShiftMutation.mutate({
      shiftId: selectedShift.id,
      updates: data
    });
  };

  // Get available tabs based on permissions
  const getAvailableTabs = () => {
    if (!permissionsData?.permissions) {
      return [];
    }
    return permissionsData.permissions.map((p: any) => ({
      id: p.tabId,
      accessLevel: p.accessLevel
    }));
  };

  const availableTabs = getAvailableTabs();
  const hasTabAccess = (tabId: string) => {
    // If permissions are still loading, allow access to prevent UI flickering
    if (permissionsLoading) return true;
    
    // If there's an error or no permissions data, provide fallback permissions
    if (permissionsError || !permissionsData?.permissions) {
      // Default permissions for business support users based on database
      const fallbackPermissions = ['dashboard', 'users', 'shifts', 'care_homes', 'timesheets', 'documents', 'reports'];
      return fallbackPermissions.includes(tabId);
    }
    
    return availableTabs.some(tab => tab.id === tabId);
  };
  const getTabAccessLevel = (tabId: string) => {
    const tab = availableTabs.find(t => t.id === tabId);
    return tab?.accessLevel || 'none';
  };

  // Desktop header
  const DesktopHeader = () => (
    <div className="hidden md:flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <img src={joyJoyLogo} alt="JoyJoy Care" className="h-52 w-auto" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Business Support Portal</h1>
          <p className="text-sm text-gray-500">Comprehensive platform management</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">Business Support</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  // Mobile header
  const MobileHeader = () => (
    <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-3">
        <img src={joyJoyLogo} alt="JoyJoy Care" className="h-52 w-auto" />
        <h1 className="text-lg font-semibold">Business Support</h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );

  // Dashboard Tab Content
  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className={`transition-all duration-200 ${
            hasTabAccess('users') 
              ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' 
              : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hasTabAccess('users')) {
              setActiveTab('users');
              toast({ title: "Navigating to User Management" });
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.newUsersThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`transition-all duration-200 ${
            hasTabAccess('shifts') 
              ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' 
              : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hasTabAccess('shifts')) {
              setActiveTab('shifts');
              toast({ title: "Navigating to Shift Management" });
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeShifts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.pendingShifts || 0} pending assignment
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`transition-all duration-200 ${
            hasTabAccess('care_homes') 
              ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' 
              : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hasTabAccess('care_homes')) {
              setActiveTab('care_homes');
              toast({ title: "Navigating to Care Homes Management" });
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Care Homes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalCareHomes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.activeCareHomes || 0} active facilities
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`transition-all duration-200 ${
            hasTabAccess('timesheets') 
              ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' 
              : 'opacity-60 cursor-not-allowed'
          }`}
          onClick={() => {
            if (hasTabAccess('timesheets')) {
              setActiveTab('timesheets');
              toast({ title: "Navigating to Timesheet Management" });
            }
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.weeklyHours || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.avgHoursPerStaff || 0} avg per staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {dashboardStats?.recentActivity?.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {dashboardStats?.systemAlerts?.map((alert: any, index: number) => (
                  <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${
                    alert.priority === 'high' ? 'bg-red-50' : 
                    alert.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.priority === 'high' ? 'text-red-500' : 
                      alert.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.timestamp}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No active alerts</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Users Tab Content
  const UsersContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers?.filter((user: any) => 
                !searchTerm || 
                `${user.firstName || user.first_name} ${user.lastName || user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName || user.first_name} {user.lastName || user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.type === 'admin' ? 'destructive' :
                      user.type === 'care_home' ? 'default' :
                      user.type === 'staff' ? 'secondary' : 'outline'
                    }>
                      {user.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive || user.is_active ? 'default' : 'destructive'}>
                      {user.isActive || user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM dd, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          console.log('Edit Profile clicked for user:', user);
                          editUserForm.reset({
                            firstName: user.firstName || user.first_name || '',
                            lastName: user.lastName || user.last_name || '',
                            phone: user.phone || '',
                            address: user.address || '',
                            postcode: user.postcode || '',
                            isActive: user.isActive ?? user.is_active ?? true
                          });
                          setSelectedUser(user);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          console.log('View Full Profile clicked for user:', user);
                          setViewProfileUser(user);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {user.isActive || user.is_active ? 'Deactivate User' : 'Activate User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...editUserForm}>
            <form onSubmit={editUserForm.handleSubmit(onUpdateUser)} className="space-y-4">
              <FormField
                control={editUserForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUserForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        User can log in and access the platform
                      </div>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Full Profile Dialog */}
      <Dialog open={!!viewProfileUser} onOpenChange={() => setViewProfileUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile - {viewProfileUser?.firstName || viewProfileUser?.first_name} {viewProfileUser?.lastName || viewProfileUser?.last_name}</DialogTitle>
          </DialogHeader>
          {viewProfileUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                      <p className="text-sm">{viewProfileUser.firstName || viewProfileUser.first_name} {viewProfileUser.lastName || viewProfileUser.last_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-sm">{viewProfileUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-sm">{viewProfileUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p className="text-sm">{viewProfileUser.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Postcode</Label>
                      <p className="text-sm">{viewProfileUser.postcode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Account Information</h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">User Type</Label>
                      <Badge variant={
                        viewProfileUser.type === 'admin' ? 'destructive' :
                        viewProfileUser.type === 'care_home' ? 'default' :
                        viewProfileUser.type === 'staff' ? 'secondary' : 'outline'
                      }>
                        {viewProfileUser.type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge variant={viewProfileUser.isActive || viewProfileUser.is_active ? 'default' : 'destructive'}>
                        {viewProfileUser.isActive || viewProfileUser.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p className="text-sm">
                        {viewProfileUser.createdAt ? format(new Date(viewProfileUser.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                      <p className="text-sm">
                        {viewProfileUser.lastLoginAt ? format(new Date(viewProfileUser.lastLoginAt), 'MMM dd, yyyy') : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setViewProfileUser(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // Shifts Tab Content
  const ShiftsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedFilters.status || 'all'} onValueChange={(value) => 
            setSelectedFilters({...selectedFilters, status: value})
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Open Shifts</p>
                <p className="text-2xl font-bold">
                  {allShifts?.filter((s: any) => s.status === 'open')?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Assigned</p>
                <p className="text-2xl font-bold">
                  {allShifts?.filter((s: any) => s.assignmentStatus === 'assigned')?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Accepted</p>
                <p className="text-2xl font-bold">
                  {allShifts?.filter((s: any) => s.assignmentStatus === 'accepted')?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Cancelled</p>
                <p className="text-2xl font-bold">
                  {allShifts?.filter((s: any) => s.status === 'cancelled')?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Care Home</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allShifts?.filter((shift: any) => 
                selectedFilters.status === 'all' || !selectedFilters.status || shift.status === selectedFilters.status
              )?.map((shift: any) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{shift.shiftRef || shift.shift_ref || `SH-${shift.id?.slice(0, 8)}`}</Badge>
                  </TableCell>
                  <TableCell>{shift.careHomeName || shift.care_home_name || 'Unknown'}</TableCell>
                  <TableCell>{shift.role}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {shift.date ? format(new Date(shift.date), 'MMM dd, yyyy') : 'Unknown Date'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {shift.start_time || shift.startTime || 'Unknown'} - 
                        {shift.end_time || shift.endTime || 'Unknown'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      shift.status === 'open' ? 'secondary' :
                      shift.assignmentStatus === 'assigned' ? 'default' :
                      shift.assignmentStatus === 'accepted' ? 'default' :
                      'destructive'
                    }>
                      {shift.assignmentStatus || shift.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {shift.staffName || shift.assignedStaffName || 'Unassigned'}
                  </TableCell>
                  <TableCell>£{shift.internalRate || shift.internal_rate || '0.00'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {getTabAccessLevel('shifts') === 'write' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedShift(shift)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No shifts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Care Homes Tab Content
  const CareHomesContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Care Home Management</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Facilities</p>
                <p className="text-2xl font-bold">{careHomes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">
                  {careHomes?.filter((ch: any) => ch.isActive || ch.is_active)?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Avg Rating</p>
                <p className="text-2xl font-bold">4.2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Care Home</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careHomes?.map((careHome: any) => (
                <TableRow key={careHome.id}>
                  <TableCell className="font-medium">{careHome.name}</TableCell>
                  <TableCell>{careHome.facility_type || careHome.facilityType || 'General'}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <div>
                      <p>{careHome.address}</p>
                      <p className="text-sm text-gray-500">{careHome.postcode}</p>
                    </div>
                  </TableCell>
                  <TableCell>Not assigned</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No care homes found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // Timesheets Tab Content
  const TimesheetsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Timesheet Management</h2>
        <div className="flex items-center space-x-2">
          <Select value={selectedFilters.timesheetStatus || 'all'} onValueChange={(value) => 
            setSelectedFilters({...selectedFilters, timesheetStatus: value})
          }>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_manager_approval">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock4 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Hours</p>
                <p className="text-2xl font-bold">
                  {timesheets?.reduce((acc: number, ts: any) => {
                    const hours = parseFloat(ts.total_hours || ts.totalHours || 0);
                    return acc + hours;
                  }, 0).toFixed(1) || "0.0"}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">
                  {timesheets?.filter((ts: any) => ts.status === 'pending_manager_approval')?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">
                  {timesheets?.filter((ts: any) => ts.status === 'approved')?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">This Week Pay</p>
                <p className="text-2xl font-bold">
                  £{(timesheets?.filter((ts: any) => ts.status === 'approved')
                    .reduce((acc: number, ts: any) => {
                      const hours = parseFloat(ts.total_hours || ts.totalHours || 0);
                      return acc + (hours * 18.50); // Average hourly rate
                    }, 0).toFixed(0) || "0")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Staff Member</TableHead>
                  <TableHead className="min-w-[180px]">Care Home</TableHead>
                  <TableHead className="min-w-[160px]">Week Period</TableHead>
                  <TableHead className="min-w-[100px]">Total Hours</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Submitted</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheetsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading timesheets...
                    </TableCell>
                  </TableRow>
                ) : timesheets?.filter((timesheet: any) => 
                  selectedFilters.timesheetStatus === 'all' || !selectedFilters.timesheetStatus || 
                  timesheet.status === selectedFilters.timesheetStatus
                )?.map((timesheet: any) => (
                  <TableRow key={timesheet.id}>
                    <TableCell className="font-medium">
                      {timesheet.staff_name || timesheet.staffName || 'Unknown Staff'}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate" title={timesheet.care_home_name || timesheet.careHomeName || 'Multiple'}>
                      {timesheet.care_home_name || timesheet.careHomeName || 'Multiple'}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const start = timesheet.week_start || timesheet.weekStart;
                          const end = timesheet.week_end || timesheet.weekEnd;
                          if (start && end) {
                            return `${format(new Date(start), 'MMM dd')} - ${format(new Date(end), 'MMM dd, yyyy')}`;
                          }
                          return 'Unknown Period';
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {parseFloat(timesheet.total_hours || timesheet.totalHours || 0).toFixed(1)}h
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        timesheet.status === 'approved' ? 'default' :
                        timesheet.status === 'pending_manager_approval' ? 'secondary' :
                        timesheet.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {timesheet.status === 'pending_manager_approval' ? 'Pending' : 
                         timesheet.status?.charAt(0).toUpperCase() + timesheet.status?.slice(1) || 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        try {
                          const date = timesheet.created_at || timesheet.createdAt;
                          return date ? format(new Date(date), 'MMM dd, yyyy') : 'Unknown';
                        } catch (error) {
                          return 'Invalid Date';
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) || (!timesheetsLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {timesheetsError ? 'Error loading timesheets' : 'No timesheets found'}
                      {timesheetsError && (
                        <p className="text-sm text-red-500 mt-2">
                          Failed to fetch timesheet data
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UsersContent />;
      case 'shifts':
        return <ShiftsContent />;
      case 'care_homes':
        return <CareHomesContent />;
      case 'timesheets':
        return <TimesheetsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DesktopHeader />
      <MobileHeader />

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-500">Business Support</div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-5">
              {hasTabAccess('dashboard') && (
                <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getTabAccessLevel('dashboard')}
                  </Badge>
                </TabsTrigger>
              )}
              {hasTabAccess('users') && (
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getTabAccessLevel('users')}
                  </Badge>
                </TabsTrigger>
              )}
              {hasTabAccess('shifts') && (
                <TabsTrigger value="shifts" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Shifts</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getTabAccessLevel('shifts')}
                  </Badge>
                </TabsTrigger>
              )}
              {hasTabAccess('care_homes') && (
                <TabsTrigger value="care_homes" className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Care Homes</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getTabAccessLevel('care_homes')}
                  </Badge>
                </TabsTrigger>
              )}
              {hasTabAccess('timesheets') && (
                <TabsTrigger value="timesheets" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Timesheets</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getTabAccessLevel('timesheets')}
                  </Badge>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hasTabAccess('dashboard') && (
                  <SelectItem value="dashboard">Dashboard ({getTabAccessLevel('dashboard')})</SelectItem>
                )}
                {hasTabAccess('users') && (
                  <SelectItem value="users">Users ({getTabAccessLevel('users')})</SelectItem>
                )}
                {hasTabAccess('shifts') && (
                  <SelectItem value="shifts">Shifts ({getTabAccessLevel('shifts')})</SelectItem>
                )}
                {hasTabAccess('care_homes') && (
                  <SelectItem value="care_homes">Care Homes ({getTabAccessLevel('care_homes')})</SelectItem>
                )}
                {hasTabAccess('timesheets') && (
                  <SelectItem value="timesheets">Timesheets ({getTabAccessLevel('timesheets')})</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Tab Content */}
          <div>
            {renderTabContent()}
          </div>
        </Tabs>
      </div>
    </div>
  );
}