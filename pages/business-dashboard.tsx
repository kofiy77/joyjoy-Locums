import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { 
  Users, 
  Building2, 
  ClipboardCheck, 
  AlertCircle, 
  MessageSquare, 
  BookOpen, 
  HeadphonesIcon,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  FileText,
  TrendingUp,
  Lock,
  LogOut
} from "lucide-react";

export default function BusinessDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [ticketResponse, setTicketResponse] = useState("");
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  console.log('BusinessDashboard - user:', user);
  
  if (!user) {
    console.log('BusinessDashboard - no user found');
    return <div>Loading...</div>;
  }

  if (user.type !== 'business') {
    console.log('BusinessDashboard - user type is not business:', user.type);
    return <div>Access denied - incorrect user type</div>;
  }

  // Fetch business support user permissions
  const { data: permissions } = useQuery({
    queryKey: ['/api/business/permissions'],
    enabled: user?.type === 'business'
  });

  // Fetch data based on permissions
  const { data: stats = {} } = useQuery({
    queryKey: ['/api/business/stats'],
    enabled: user?.type === 'business' && permissions?.overview
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/business/users'],
    enabled: user?.type === 'business' && permissions?.users
  });

  const { data: practices = [], isLoading: practicesLoading } = useQuery({
    queryKey: ['/api/business/practices'],
    enabled: user?.type === 'business' && permissions?.practices
  });

  const { data: expiringCertifications = [] } = useQuery({
    queryKey: ['/api/business/certifications/expiring'],
    enabled: user?.type === 'business' && permissions?.expiryTracking
  });

  const { data: supportTickets = [] } = useQuery({
    queryKey: ['/api/business/support-tickets'],
    enabled: user?.type === 'business' && permissions?.support
  });

  const { data: trainingVideos = [] } = useQuery({
    queryKey: ['/api/business/training-videos'],
    enabled: user?.type === 'business' && permissions?.training
  });

  const { data: enquiries = [], isLoading: enquiriesLoading, refetch: refetchEnquiries } = useQuery({
    queryKey: ['/api/business/practice-enquiries'],
    enabled: user?.type === 'business' && permissions?.enquiries
  });

  // Support ticket response mutation
  const respondToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, response }: { ticketId: number; response: string }) => {
      return apiRequest('POST', `/api/business/support-tickets/${ticketId}/response`, { response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business/support-tickets'] });
      setShowTicketDialog(false);
      setTicketResponse("");
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the user.",
      });
    }
  });

  // Enquiry update mutation
  const updateEnquiryMutation = useMutation({
    mutationFn: async (enquiryUpdate: any) => {
      return await apiRequest(`/api/business/practice-enquiries/${enquiryUpdate.id}`, "PATCH", enquiryUpdate);
    },
    onSuccess: () => {
      refetchEnquiries();
      toast({
        title: "Enquiry Updated",
        description: "The enquiry has been updated successfully.",
      });
    }
  });

  // Permission check helper
  const hasPermission = (permission: string) => {
    return permissions?.[permission] === true;
  };

  if (!user || user.type !== 'business') {
    return <div className="p-8 text-center">Access denied. Business support access required.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Support Portal</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName} {user.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            Business Support Manager
          </Badge>
          
          {/* Change Password Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowChangePasswordDialog(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          
          {/* Logout Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 mobile-tabs">
          {hasPermission('overview') && (
            <TabsTrigger value="overview" className="mobile-tab-text">
              <span className="truncate">Overview</span>
            </TabsTrigger>
          )}
          {hasPermission('users') && (
            <TabsTrigger value="users" className="mobile-tab-text">
              <span className="truncate">Users</span>
            </TabsTrigger>
          )}
          {hasPermission('practices') && (
            <TabsTrigger value="practices" className="mobile-tab-text">
              <span className="truncate">GP Practices</span>
            </TabsTrigger>
          )}
          {hasPermission('enquiries') && (
            <TabsTrigger value="enquiries" className="mobile-tab-text">
              <span className="truncate">Enquiries</span>
            </TabsTrigger>
          )}
          {hasPermission('certifications') && (
            <TabsTrigger value="certifications" className="mobile-tab-text">
              <span className="truncate">Certifications</span>
            </TabsTrigger>
          )}
          {hasPermission('training') && (
            <TabsTrigger value="training" className="mobile-tab-text">
              <span className="truncate">Training</span>
            </TabsTrigger>
          )}
          {hasPermission('support') && (
            <TabsTrigger value="support" className="mobile-tab-text">
              <span className="truncate">Support</span>
            </TabsTrigger>
          )}
        </TabsList>

        {hasPermission('overview') && (
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.newUsersThisWeek || 0} this week
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active GP Practices</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPractices || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {stats.totalRegions || 0} regions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Certifications</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.expiringCertifications || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Next 30 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                  <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.openTickets || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Requiring attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <UserCheck className="h-4 w-4 mt-1 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">New GP practice registered</p>
                        <p className="text-xs text-muted-foreground">Harley Street Medical Centre - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <ClipboardCheck className="h-4 w-4 mt-1 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">Certification verified</p>
                        <p className="text-xs text-muted-foreground">DBS check for Maria Santos - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-4 w-4 mt-1 text-orange-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">Support ticket created</p>
                        <p className="text-xs text-muted-foreground">Login issues - Westminster Medical Practice - 6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common business support tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Review Pending Certifications
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Handle Support Tickets
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Training Content
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {hasPermission('users') && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.type === 'admin' ? 'default' : user.type === 'practice' ? 'secondary' : 'outline'}>
                          {user.type.replace('_', ' ')}
                        </Badge>
                        {user.isActive ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> : 
                          <XCircle className="h-4 w-4 text-red-500" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasPermission('practices') && (
          <TabsContent value="practices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GP Practice Directory</CardTitle>
                <CardDescription>Registered GP practices and medical facilities</CardDescription>
              </CardHeader>
              <CardContent>
                {practicesLoading ? (
                  <div className="text-center py-8">Loading GP practices...</div>
                ) : practices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No GP practices found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      Found {practices.length} GP practices
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {practices.map((practice: any) => (
                        <Card key={practice.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{practice.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {practice.address}
                                </CardDescription>
                              </div>
                              <Badge variant={practice.cqcRating === 'Outstanding' ? 'default' : 'secondary'}>
                                {practice.cqcRating}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{practice.facilityType}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{practice.mainPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{practice.emailAddress}</span>
                              </div>
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
        )}

        {hasPermission('certifications') && (
          <TabsContent value="certifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expiring Certifications</CardTitle>
                <CardDescription>Certifications requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expiringCertifications.map((cert: any) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          new Date(cert.expiryDate) < new Date() ? 'bg-red-500' : 
                          new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.staffFirstName} {cert.staffLastName} - {cert.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                        </p>
                        <Badge variant={
                          new Date(cert.expiryDate) < new Date() ? 'destructive' : 'secondary'
                        }>
                          {new Date(cert.expiryDate) < new Date() ? 'Expired' : 'Expiring Soon'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasPermission('support') && (
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Customer support requests and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{ticket.title}</h3>
                            <Badge variant={
                              ticket.status === 'open' ? 'destructive' :
                              ticket.status === 'in_progress' ? 'default' : 'secondary'
                            }>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">{ticket.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>#{ticket.id}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            <span>{ticket.userEmail}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketDialog(true);
                          }}
                        >
                          Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasPermission('enquiries') && (
          <TabsContent value="enquiries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>GP Practice Enquiries</CardTitle>
                <CardDescription>Manage partnership enquiries and follow-up processes</CardDescription>
              </CardHeader>
              <CardContent>
                {enquiriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading enquiries...</span>
                  </div>
                ) : enquiries && enquiries.length > 0 ? (
                  <div className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Total Enquiries</p>
                              <p className="text-2xl font-bold">{enquiries.length}</p>
                            </div>
                            <Mail className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">New Enquiries</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {enquiries.filter((e: any) => e.status === 'new').length}
                              </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                              <p className="text-2xl font-bold text-orange-600">
                                {enquiries.filter((e: any) => e.status === 'in_progress').length}
                              </p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Completed</p>
                              <p className="text-2xl font-bold text-green-600">
                                {enquiries.filter((e: any) => e.status === 'completed').length}
                              </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Enquiries List */}
                    <div className="space-y-4">
                      {enquiries.map((enquiry: any) => (
                        <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-lg">{enquiry.care_home_name || enquiry.careHomeName}</h3>
                                  <Badge className={`px-2 py-1 text-xs font-medium ${
                                    enquiry.care_setting_type === 'residential' ? 'bg-blue-100 text-blue-800' :
                                    enquiry.care_setting_type === 'nursing' ? 'bg-green-100 text-green-800' :
                                    enquiry.care_setting_type === 'domiciliary' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {enquiry.care_setting_type ? enquiry.care_setting_type.charAt(0).toUpperCase() + enquiry.care_setting_type.slice(1) : 'General'}
                                  </Badge>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    enquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                    enquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                                    enquiry.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                                    enquiry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    enquiry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {enquiry.status === 'new' ? 'New' :
                                     enquiry.status === 'contacted' ? 'Contacted' :
                                     enquiry.status === 'in_progress' ? 'In Progress' :
                                     enquiry.status === 'approved' ? 'Approved' :
                                     enquiry.status === 'rejected' ? 'Rejected' :
                                     'Completed'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{enquiry.manager_name || enquiry.managerName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{enquiry.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{enquiry.contact_phone || enquiry.contactPhone}</span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{enquiry.location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {enquiry.care_setting_type === 'domiciliary' ? 
                                        `${enquiry.facility_capacity || enquiry.numberOfBeds} clients` : 
                                        `${enquiry.facility_capacity || enquiry.numberOfBeds} beds`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{new Date(enquiry.created_at || enquiry.createdAt).toLocaleDateString('en-GB')}</span>
                                  </div>
                                </div>
                                
                                {/* Dynamic Care Type Specific Information */}
                                {(enquiry.specializations?.length > 0 || enquiry.services_offered?.length > 0 || 
                                  enquiry.urgent_staffing_needs || enquiry.cqc_registration_number) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t">
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
                                )}
                                
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
                                
                                {enquiry.additional_info && (
                                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm">{enquiry.additional_info}</p>
                                  </div>
                                )}
                                
                                {enquiry.additionalInfo && (
                                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm">{enquiry.additionalInfo}</p>
                                  </div>
                                )}
                                
                                {enquiry.notes && (
                                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900 mb-1">Notes:</p>
                                    <p className="text-sm text-blue-800">{enquiry.notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    // Quick status update functionality
                                    const newStatus = enquiry.status === 'new' ? 'contacted' : 
                                                     enquiry.status === 'contacted' ? 'in_progress' : 
                                                     'completed';
                                    updateEnquiryMutation.mutate({
                                      id: enquiry.id,
                                      status: newStatus
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Update Status
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
                    <p className="text-gray-500">No GP practice enquiries have been submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasPermission('training') && (
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Content</CardTitle>
                <CardDescription>Manage training videos and materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Training content management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Support Ticket Response Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Support Ticket</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.id}: {selectedTicket?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Response</Label>
              <Textarea
                id="response"
                value={ticketResponse}
                onChange={(e) => setTicketResponse(e.target.value)}
                placeholder="Enter your response to the customer..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedTicket && respondToTicketMutation.mutate({
                  ticketId: selectedTicket.id,
                  response: ticketResponse
                })}
                disabled={!ticketResponse.trim() || respondToTicketMutation.isPending}
              >
                Send Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordDialog 
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
    </div>
  );
}