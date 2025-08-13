import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Eye, Edit, UserX, UserCheck, Search, Filter, 
  Phone, MapPin, Calendar, Shield, Mail, Building2,
  CheckCircle, XCircle, AlertTriangle, User
} from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone: string;
  address: string;
  postcode: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  national_insurance_number: string;
  is_active: boolean;
  registration_status: string;
  created_at: string;
  job_role?: string;
  experience_level?: number;
  hourly_rate?: string;
  availability?: any;
  max_distance?: number;
  compliance?: any;
}

export function ComprehensiveUserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Fetch users with direct response handling and debugging
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/users"], // Remove timestamp to allow proper caching
    queryFn: async () => {
      console.log('🔍 COMPREHENSIVE: Starting users fetch...');
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('❌ COMPREHENSIVE: No auth token found');
        throw new Error('No authentication token');
      }

      console.log('🔍 COMPREHENSIVE: Token length:', token.length);

      try {
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('🔍 COMPREHENSIVE: Response status:', response.status);
        console.log('🔍 COMPREHENSIVE: Response ok:', response.ok);
        console.log('🔍 COMPREHENSIVE: Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ COMPREHENSIVE: Error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get response as text first to see raw content
        const responseText = await response.text();
        console.log('🔍 COMPREHENSIVE: Raw response text:', responseText);

        // Try to parse JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ COMPREHENSIVE: JSON parse error:', parseError);
          console.error('❌ COMPREHENSIVE: Failed to parse:', responseText);
          throw new Error('Invalid JSON response');
        }

        console.log('🔍 COMPREHENSIVE: Parsed data type:', typeof data);
        console.log('🔍 COMPREHENSIVE: Is array:', Array.isArray(data));
        console.log('🔍 COMPREHENSIVE: Data content:', data);
        
        if (!Array.isArray(data)) {
          console.error('❌ COMPREHENSIVE: Expected array, got:', typeof data);
          console.error('❌ COMPREHENSIVE: Data keys:', Object.keys(data || {}));
          
          // If it's an object with a data property, extract it
          if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
            console.log('🔍 COMPREHENSIVE: Found data property, extracting...');
            return data.data;
          }
          
          throw new Error(`Invalid response format - expected array, got ${typeof data}`);
        }
        
        console.log('✅ COMPREHENSIVE: Successfully parsed', data.length, 'users');
        
        // Log first user for debugging
        if (data.length > 0) {
          console.log('🔍 COMPREHENSIVE: First user sample:', data[0]);
        }
        
        return data;
      } catch (fetchError) {
        console.error('❌ COMPREHENSIVE: Fetch error:', fetchError);
        throw fetchError;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 0
  });

  // Ensure users is properly assigned from the query data
  const users = data || [];
  
  console.log('🔍 COMPONENT STATE CHECK:', { 
    dataExists: !!data, 
    dataLength: data?.length || 0, 
    usersLength: users.length,
    isLoading 
  });

  // User activation/deactivation mutation
  const activationMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      return await apiRequest(`/api/admin/users/${userId}/activation`, {
        method: 'PATCH',
        body: { isActive }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // User update mutation
  const updateMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const token = localStorage.getItem('auth_token');
      
      // Map frontend field names to backend expected field names
      const backendData = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        postcode: userData.postcode,
        emergencyContactName: userData.emergency_contact_name,
        emergencyContactPhone: userData.emergency_contact_phone,
        nationalInsuranceNumber: userData.national_insurance_number,
        dateOfBirth: userData.date_of_birth,
      };

      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT', // Changed to PUT to match backend endpoint
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditDialog(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter users with debugging
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);

    const matchesRole = filterRole === "all" || user.user_type === filterRole;
    const matchesStatus = filterStatus === "all" || user.registration_status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });



  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ ...user });
    setShowEditDialog(true);
  };

  const handleActivate = (userId: string, currentStatus: boolean) => {
    activationMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleSaveEdit = () => {
    if (editFormData.id) {
      updateMutation.mutate(editFormData);
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'care_home': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'business_support': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_documents': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
            <p className="font-semibold">Error loading users</p>
            <p className="text-sm mt-2">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
            <Badge variant="secondary">{filteredUsers.length} users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_documents">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No users found matching your criteria</p>
                <p className="text-xs text-gray-500 mt-2">
                  Raw users count: {users.length} | Filter results: {filteredUsers.length}
                </p>
              </div>
            ) : (
              filteredUsers.map((user: User) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getUserTypeColor(user.user_type)}>
                            {user.user_type ? String(user.user_type).replace('_', ' ') : 'Unknown'}
                          </Badge>
                          <Badge className={getStatusColor(user.registration_status)}>
                            {user.registration_status ? String(user.registration_status).replace('_', ' ') : 'Unknown'}
                          </Badge>
                          {user.is_active ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.postcode || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                        {user.job_role && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {user.job_role}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleActivate(user.id, user.is_active)}
                        disabled={activationMutation.isPending}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Details: {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                    <p className="text-sm">{selectedUser.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">National Insurance</Label>
                    <p className="text-sm">{selectedUser.national_insurance_number || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">User Type</Label>
                    <Badge className={getUserTypeColor(selectedUser.user_type)}>
                      {selectedUser.user_type ? String(selectedUser.user_type).replace('_', ' ') : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Address Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-sm">{selectedUser.address || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Postcode</Label>
                    <p className="text-sm">{selectedUser.postcode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact Name</Label>
                    <p className="text-sm">{selectedUser.emergency_contact_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Contact Phone</Label>
                    <p className="text-sm">{selectedUser.emergency_contact_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information (for staff) */}
              {selectedUser.user_type === 'staff' && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Job Role</Label>
                      <p className="text-sm">{selectedUser.job_role || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Experience Level</Label>
                      <p className="text-sm">{selectedUser.experience_level ? `${selectedUser.experience_level} years` : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Hourly Rate</Label>
                      <p className="text-sm">{selectedUser.hourly_rate ? `£${selectedUser.hourly_rate}` : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Max Distance</Label>
                      <p className="text-sm">{selectedUser.max_distance ? `${selectedUser.max_distance} miles` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Registration Status</Label>
                    <Badge className={getStatusColor(selectedUser.registration_status)}>
                      {selectedUser.registration_status ? String(selectedUser.registration_status).replace('_', ' ') : 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                    <Badge className={selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                    <p className="text-sm">
                      {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User: {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={editFormData.first_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={editFormData.last_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={editFormData.date_of_birth || ''}
                    onChange={(e) => setEditFormData({...editFormData, date_of_birth: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="national_insurance_number">National Insurance</Label>
                  <Input
                    id="national_insurance_number"
                    value={editFormData.national_insurance_number || ''}
                    onChange={(e) => setEditFormData({...editFormData, national_insurance_number: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Address Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={editFormData.postcode || ''}
                    onChange={(e) => setEditFormData({...editFormData, postcode: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={editFormData.emergency_contact_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, emergency_contact_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={editFormData.emergency_contact_phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, emergency_contact_phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_role">Job Role</Label>
                  <Select 
                    value={editFormData.job_role || ''} 
                    onValueChange={(value) => setEditFormData({...editFormData, job_role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
                      <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
                      <SelectItem value="support_worker">Support Worker</SelectItem>
                      <SelectItem value="care_assistant">Care Assistant</SelectItem>
                      <SelectItem value="senior_carer">Senior Carer</SelectItem>
                      <SelectItem value="activities_coordinator">Activities Coordinator</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="team_leader">Team Leader</SelectItem>
                      <SelectItem value="deputy_manager">Deputy Manager</SelectItem>
                      <SelectItem value="care_manager">Care Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Input
                    id="experience_level"
                    type="number"
                    value={editFormData.experience_level || ''}
                    onChange={(e) => setEditFormData({...editFormData, experience_level: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input
                    id="hourly_rate"
                    value={editFormData.hourly_rate || ''}
                    onChange={(e) => setEditFormData({...editFormData, hourly_rate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="max_distance">Max Distance</Label>
                  <Input
                    id="max_distance"
                    type="number"
                    value={editFormData.max_distance || ''}
                    onChange={(e) => setEditFormData({...editFormData, max_distance: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_status">Registration Status</Label>
                  <Select 
                    value={editFormData.registration_status || 'pending_documents'} 
                    onValueChange={(value) => setEditFormData({...editFormData, registration_status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_documents">Pending Documents</SelectItem>
                      <SelectItem value="documents_submitted">Documents Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="is_active">Account Status</Label>
                  <Select 
                    value={editFormData.is_active ? 'active' : 'inactive'} 
                    onValueChange={(value) => setEditFormData({...editFormData, is_active: value === 'active'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}