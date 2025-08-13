import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, MapPin, Shield, Award, FileText, Mail, Edit, Eye, 
  UserPlus, Phone, Calendar, UserCheck, UserX
} from "lucide-react";

interface EnhancedUserManagementProps {
  setShowCreateManagerDialog: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  setShowCreateBusinessSupportDialog?: (show: boolean) => void;
}

export function EnhancedUserManagement({ setShowCreateManagerDialog, setActiveTab, setShowCreateBusinessSupportDialog }: EnhancedUserManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Force refresh data on component mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
  }, [queryClient]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);
  const [showUserViewDialog, setShowUserViewDialog] = useState(false);

  // Enhanced data queries with compliance details
  const { data: users = [] } = useQuery({ 
    queryKey: ['/api/admin/users', Date.now()], // Force refresh with timestamp
    queryFn: async () => {
      const response = await apiRequest('/api/admin/users');
      console.log('🔍 Users data received:', response);
      if (Array.isArray(response) && response.length > 0) {
        console.log('🔍 First user compliance data:', response[0].compliance);
      }
      return response;
    }
  });

  // Note: Compliance data is now included directly in each user object from /api/admin/users

  // User update mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => apiRequest(`/api/admin/users/${userData.id}`, {
      method: 'PUT',
      body: userData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User updated successfully" });
      setShowUserEditDialog(false);
    }
  });

  // User activation mutation
  const activateUserMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      console.log(`🔄 Sending activation request for user ${userId} to ${isActive ? 'activate' : 'deactivate'}`);
      
      const result = await apiRequest(`/api/admin/users/${userId}/activation`, {
        method: 'PATCH',
        body: { isActive }
      });
      
      console.log(`✅ Activation response:`, result);
      return result;
    },
    onMutate: async ({ userId, isActive }) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['/api/admin/users'] });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(['/api/admin/users']);

      // Optimistically update to the new value
      queryClient.setQueryData(['/api/admin/users'], (old: any) => {
        if (Array.isArray(old)) {
          return old.map((user: any) => 
            user.id === userId 
              ? { ...user, isActive: isActive, is_active: isActive }
              : user
          );
        }
        return old;
      });

      // Show immediate feedback
      toast({ 
        title: `${isActive ? 'Activating' : 'Deactivating'} user...`,
        description: `Please wait while we update the user status.`
      });

      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onSuccess: (data, variables) => {
      // Update the cache with the actual response data (no invalidation needed)
      queryClient.setQueryData(['/api/admin/users'], (old: any) => {
        if (Array.isArray(old)) {
          return old.map((user: any) => 
            user.id === variables.userId 
              ? { ...user, is_active: variables.isActive, isActive: variables.isActive }
              : user
          );
        }
        return old;
      });
      
      toast({ 
        title: `User ${variables.isActive ? 'activated' : 'deactivated'} successfully`,
        description: `User status has been updated.`
      });
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(['/api/admin/users'], context.previousUsers);
      }
      toast({ 
        title: "Error updating user status",
        description: error?.message || "Failed to update user activation status",
        variant: "destructive"
      });
    },
    // Removed onSettled to prevent unnecessary refetch
  });

  const handleUserActivation = (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    console.log(`🔄 Activating user ${userId} - changing from ${currentStatus} to ${newStatus}`);
    activateUserMutation.mutate({ userId, isActive: newStatus });
  };

  // Enhanced filtering logic
  const filteredUsers = Array.isArray(users) ? users.filter((user: any) => {
    const fullName = `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim();
    const matchesSearch = !searchTerm || 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const userType = user.user_type || user.type;
    const matchesRole = filterRole === 'all' || userType === filterRole;
    
    const userActive = user.is_active || user.isActive;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && userActive) ||
      (filterStatus === 'inactive' && !userActive) ||
      (filterStatus === 'pending_approval' && user.registrationStatus === 'pending_documents');
    
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  // Get compliance data for user (now directly from user object)
  const getUserCompliance = (user: any) => {
    console.log(`🔍 Getting compliance for ${user.first_name}:`, user.compliance);
    return user.compliance || {
      dbsStatus: 'unknown',
      rtwStatus: 'unknown',
      certificationCount: 0,
      documentsCount: 0
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Enhanced User Management & Compliance
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateManagerDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Care Home Manager
            </Button>
            {setShowCreateBusinessSupportDialog && (
              <Button 
                onClick={() => setShowCreateBusinessSupportDialog(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Add Business Support
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Comprehensive user management with compliance tracking, verification status, and detailed profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Advanced Search and Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search by name, email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72"
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

        {/* Enhanced User List with Direct Action Buttons */}
        <div className="space-y-4">
          {Array.isArray(filteredUsers) && filteredUsers.map((user: any) => {
            const compliance = getUserCompliance(user);
            
            return (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Primary User Information */}
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {user.first_name || user.firstName} {user.last_name || user.lastName}
                        </h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    {/* Contact and Location Details */}
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
                      {(user.date_of_birth || user.dateOfBirth) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Born: {new Date(user.date_of_birth || user.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Staff Compliance Dashboard */}
                    {(user.user_type || user.type) === 'staff' && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <h4 className="font-medium text-sm mb-2">Compliance Status</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <Badge 
                            variant={
                              compliance.dbsStatus === 'valid' ? 'default' : 
                              compliance.dbsStatus === 'pending' ? 'secondary' : 
                              'destructive'
                            } 
                            className="text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            DBS: {compliance.dbsStatus || 'Unknown'}
                          </Badge>
                          <Badge 
                            variant={
                              compliance.rtwStatus === 'valid' ? 'default' : 
                              compliance.rtwStatus === 'pending' ? 'secondary' : 
                              'destructive'
                            } 
                            className="text-xs"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            RTW: {compliance.rtwStatus || 'Unknown'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {compliance.certificationCount || 0} Certs
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {compliance.documentsCount || 0} Docs
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Registration Status for New Users */}
                    {user.registrationStatus && user.registrationStatus !== 'approved' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-yellow-800">
                          Registration Status: <strong>{user.registrationStatus.replace('_', ' ').toUpperCase()}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons and Status Badges */}
                  <div className="flex items-start gap-2">
                    <div className="flex flex-col gap-2">
                      <Badge variant={
                        (user.user_type || user.type) === 'admin' ? 'default' : 
                        (user.user_type || user.type) === 'care_home' ? 'secondary' : 
                        (user.user_type || user.type) === 'business_support' ? 'outline' :
                        'secondary'
                      }>
                        {(user.user_type || user.type)?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant={(user.is_active || user.isActive) ? 'default' : 'destructive'}>
                        {(user.is_active || user.isActive) ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {/* Primary Actions Row */}
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserViewDialog(true);
                          }}
                          className="h-8 px-2"
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserEditDialog(true);
                          }}
                          className="h-8 px-2"
                          title="Edit Profile"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Send Message",
                              description: `Opening message dialog for ${user.firstName || user.name || user.email}`,
                            });
                          }}
                          className="h-8 px-2"
                          title="Send Message"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Staff Quick Actions */}
                      {user.type === 'staff' && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("certifications")}
                            className="h-7 px-2 text-xs"
                            title="View Certifications"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            Certs
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab("documents")}
                            className="h-7 px-2 text-xs"
                            title="View Documents"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                        </div>
                      )}
                      
                      {/* Activation Button */}
                      <Button
                        variant={(user.is_active || user.isActive) ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleUserActivation(user.id, user.is_active || user.isActive)}
                        disabled={activateUserMutation.isPending}
                        className="h-8 text-xs"
                      >
                        {activateUserMutation.isPending ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
                        ) : (user.isActive || user.is_active) ? (
                          <UserX className="h-3 w-3 mr-1" />
                        ) : (
                          <UserCheck className="h-3 w-3 mr-1" />
                        )}
                        {activateUserMutation.isPending ? 'Updating...' : ((user.isActive || user.is_active) ? 'Deactivate' : 'Activate')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {(!Array.isArray(filteredUsers) || filteredUsers.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your search criteria or filters'
                  : 'No users have been added to the system yet'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>


      {/* User View Dialog */}
      <Dialog open={showUserViewDialog} onOpenChange={setShowUserViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Personal Information</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Name:</span> {(selectedUser.first_name || selectedUser.firstName)} {(selectedUser.last_name || selectedUser.lastName)}</p>
                    <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                    <p><span className="font-medium">Date of Birth:</span> {(selectedUser.date_of_birth || selectedUser.dateOfBirth) || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Account Information</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Role:</span> {
                      (selectedUser.user_type || selectedUser.type) === 'staff' && selectedUser.job_role 
                        ? selectedUser.job_role 
                        : (selectedUser.user_type || selectedUser.type)?.replace('_', ' ').toUpperCase()
                    }</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge variant={(selectedUser.isActive || selectedUser.is_active) ? 'default' : 'destructive'} className="ml-2">
                        {(selectedUser.isActive || selectedUser.is_active) ? 'Active' : 'Inactive'}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Registration:</span> {selectedUser.registrationStatus || 'Approved'}</p>
                  </div>
                </div>
              </div>

              {selectedUser.address && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Address</h4>
                  <div className="mt-2">
                    <p>{selectedUser.address}</p>
                    <p>{selectedUser.postcode}</p>
                  </div>
                </div>
              )}

              {(selectedUser.user_type === 'staff' || selectedUser.type === 'staff') && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Professional Information</h4>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Job Role:</span> {selectedUser.role || selectedUser.jobRole || 'Not specified'}</p>
                      <p><span className="font-medium">Experience:</span> {selectedUser.experience || 'Not specified'} years</p>
                      <p><span className="font-medium">Hourly Rate:</span> £{selectedUser.hourly_rate || selectedUser.hourlyRate || 'Not set'}</p>
                      <p><span className="font-medium">Preferred Locations:</span> {selectedUser.preferred_locations?.join(', ') || 'Not specified'}</p>
                      <p><span className="font-medium">Max Distance:</span> {selectedUser.max_distance || 'Not specified'} miles</p>
                    </div>
                  </div>

                  {/* Additional Registration Data */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Registration Details</h4>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Additional Skills:</span> {selectedUser.additional_skills || 'None specified'}</p>
                      <p><span className="font-medium">Previous Experience:</span> {selectedUser.previous_experience || 'None specified'}</p>
                      <p><span className="font-medium">References:</span> {selectedUser.references || 'None provided'}</p>
                      <p><span className="font-medium">Registration Source:</span> {selectedUser.registration_source || 'Unknown'}</p>
                      <p><span className="font-medium">Registration Complete:</span> 
                        <Badge variant={selectedUser.registration_complete ? 'default' : 'secondary'} className="ml-2">
                          {selectedUser.registration_complete ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </p>
                    </div>
                  </div>

                  {/* Emergency Contact Information */}
                  {(selectedUser.emergency_contact_name || selectedUser.emergency_contact_phone) && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Emergency Contact</h4>
                      <div className="mt-2 space-y-2">
                        <p><span className="font-medium">Contact Name:</span> {selectedUser.emergency_contact_name || 'Not provided'}</p>
                        <p><span className="font-medium">Contact Phone:</span> {selectedUser.emergency_contact_phone || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  {/* Consent Information */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Consent & Compliance</h4>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">National Insurance:</span> {selectedUser.national_insurance_number ? '****' + selectedUser.national_insurance_number.slice(-4) : 'Not provided'}</p>
                      <div className="flex items-center gap-4">
                        <p><span className="font-medium">Reference Checks Consent:</span> 
                          <Badge variant={selectedUser.consent_reference_checks ? 'default' : 'destructive'} className="ml-2">
                            {selectedUser.consent_reference_checks ? 'Granted' : 'Not granted'}
                          </Badge>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p><span className="font-medium">DBS Checks Consent:</span> 
                          <Badge variant={selectedUser.consent_dbs_checks ? 'default' : 'destructive'} className="ml-2">
                            {selectedUser.consent_dbs_checks ? 'Granted' : 'Not granted'}
                          </Badge>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p><span className="font-medium">Terms & Conditions:</span> 
                          <Badge variant={selectedUser.agree_terms_conditions ? 'default' : 'destructive'} className="ml-2">
                            {selectedUser.agree_terms_conditions ? 'Agreed' : 'Not agreed'}
                          </Badge>
                        </p>
                      </div>
                      {selectedUser.consent_timestamp && (
                        <p><span className="font-medium">Consent Date:</span> {new Date(selectedUser.consent_timestamp).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Availability Information */}
                  {selectedUser.availability && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Availability</h4>
                      <div className="mt-2">
                        <div className="grid grid-cols-7 gap-1">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                            const dayKey = day.toLowerCase();
                            const isAvailable = selectedUser.availability?.[dayKey];
                            return (
                              <div key={day} className="text-center">
                                <div className="text-xs font-medium mb-1">{day.slice(0, 3)}</div>
                                <Badge variant={isAvailable ? 'default' : 'outline'} className="text-xs">
                                  {isAvailable ? 'Yes' : 'No'}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedUser.type === 'care_home' && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide">Care Home Information</h4>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Facility:</span> {selectedUser.facilityName || 'Not specified'}</p>
                    <p><span className="font-medium">CQC Registration:</span> {selectedUser.cqcRegistration || 'Not provided'}</p>
                    <p><span className="font-medium">Capacity:</span> {selectedUser.capacity || 'Not specified'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Edit Dialog */}
      <Dialog open={showUserEditDialog} onOpenChange={setShowUserEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    defaultValue={selectedUser.first_name || selectedUser.firstName || ''} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    defaultValue={selectedUser.last_name || selectedUser.lastName || ''} 
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={selectedUser.email} 
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  defaultValue={selectedUser.phone} 
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  defaultValue={selectedUser.address} 
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input 
                    id="postcode" 
                    defaultValue={selectedUser.postcode} 
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={(selectedUser.isActive || selectedUser.is_active) ? 'active' : 'inactive'}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(selectedUser.type === 'staff' || selectedUser.user_type === 'staff') && (
                <div className="space-y-6">
                  {/* Date of Birth */}
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date"
                      defaultValue={selectedUser.date_of_birth || selectedUser.dateOfBirth} 
                      className="mt-1"
                    />
                  </div>

                  {/* Professional Information Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide border-b pb-2">Professional Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobRole">Job Role</Label>
                        <Select name="jobRole" defaultValue={selectedUser.role || selectedUser.jobRole || selectedUser.job_role}>
                          <SelectTrigger className="mt-1" id="jobRole">
                            <SelectValue placeholder="Select job role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
                            <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
                            <SelectItem value="senior_carer">Senior Carer</SelectItem>
                            <SelectItem value="support_worker">Support Worker</SelectItem>
                            <SelectItem value="activities_coordinator">Activities Coordinator</SelectItem>
                            <SelectItem value="care_assistant">Care Assistant</SelectItem>
                            <SelectItem value="team_leader">Team Leader</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience">Experience (years)</Label>
                        <Input 
                          id="experience" 
                          type="number" 
                          defaultValue={selectedUser.experience} 
                          className="mt-1"
                          placeholder="Years of experience"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                        <Input 
                          id="hourlyRate" 
                          type="number" 
                          step="0.01" 
                          defaultValue={selectedUser.hourly_rate || selectedUser.hourlyRate} 
                          className="mt-1"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxDistance">Max Travel Distance (miles)</Label>
                        <Input 
                          id="maxDistance" 
                          type="number" 
                          defaultValue={selectedUser.max_distance} 
                          className="mt-1"
                          placeholder="Maximum miles willing to travel"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferredLocations">Preferred Locations</Label>
                      <Input 
                        id="preferredLocations" 
                        defaultValue={selectedUser.preferred_locations?.join(', ') || ''} 
                        className="mt-1"
                        placeholder="Comma-separated list of preferred locations"
                      />
                    </div>
                  </div>

                  {/* Registration Details Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide border-b pb-2">Registration Details</h4>
                    
                    <div>
                      <Label htmlFor="additionalSkills">Additional Skills</Label>
                      <Input 
                        id="additionalSkills" 
                        defaultValue={selectedUser.additional_skills} 
                        className="mt-1"
                        placeholder="Any additional skills or certifications"
                      />
                    </div>

                    <div>
                      <Label htmlFor="previousExperience">Previous Experience Details</Label>
                      <Input 
                        id="previousExperience" 
                        defaultValue={selectedUser.previous_experience} 
                        className="mt-1"
                        placeholder="Details about previous work experience"
                      />
                    </div>

                    <div>
                      <Label htmlFor="references">References</Label>
                      <Input 
                        id="references" 
                        defaultValue={selectedUser.references} 
                        className="mt-1"
                        placeholder="Reference contacts or details"
                      />
                    </div>

                    <div>
                      <Label htmlFor="registrationSource">Registration Source</Label>
                      <Select defaultValue={selectedUser.registration_source}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="How did you hear about us?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="job_board">Job Board</SelectItem>
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide border-b pb-2">Emergency Contact Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                        <Input 
                          id="emergencyContactName" 
                          defaultValue={selectedUser.emergency_contact_name} 
                          className="mt-1"
                          placeholder="Full name of emergency contact"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                        <Input 
                          id="emergencyContactPhone" 
                          defaultValue={selectedUser.emergency_contact_phone} 
                          className="mt-1"
                          placeholder="Emergency contact phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compliance Information Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide border-b pb-2">Compliance & Documentation</h4>
                    
                    <div>
                      <Label htmlFor="nationalInsurance">National Insurance Number</Label>
                      <Input 
                        id="nationalInsurance" 
                        defaultValue={selectedUser.national_insurance_number} 
                        className="mt-1"
                        placeholder="National Insurance Number"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="consentReferenceChecks">Reference Checks Consent</Label>
                        <Select defaultValue={selectedUser.consent_reference_checks ? 'true' : 'false'}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Granted</SelectItem>
                            <SelectItem value="false">Not Granted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="consentDbsChecks">DBS Checks Consent</Label>
                        <Select defaultValue={selectedUser.consent_dbs_checks ? 'true' : 'false'}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Granted</SelectItem>
                            <SelectItem value="false">Not Granted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="agreeTermsConditions">Terms & Conditions</Label>
                        <Select defaultValue={selectedUser.agree_terms_conditions ? 'true' : 'false'}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Agreed</SelectItem>
                            <SelectItem value="false">Not Agreed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="registrationComplete">Registration Status</Label>
                      <Select defaultValue={selectedUser.registration_complete ? 'true' : 'false'}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Complete</SelectItem>
                          <SelectItem value="false">Incomplete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wide border-b pb-2">Weekly Availability</h4>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const dayKey = day.toLowerCase();
                        const isAvailable = selectedUser.availability?.[dayKey];
                        return (
                          <div key={day} className="text-center">
                            <div className="text-xs font-medium mb-2">{day.slice(0, 3)}</div>
                            <Select defaultValue={isAvailable ? 'true' : 'false'}>
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Available</SelectItem>
                                <SelectItem value="false">Not Available</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Collect all form data
                  const formData = new FormData();
                  const formElements = document.querySelectorAll('#firstName, #lastName, #email, #phone, #address, #postcode, #dateOfBirth, #experience, #hourlyRate, #maxDistance, #preferredLocations, #additionalSkills, #previousExperience, #references, #nationalInsurance, #emergencyContactName, #emergencyContactPhone');
                  
                  const updateData: any = {
                    id: selectedUser.id,
                    firstName: (document.getElementById('firstName') as HTMLInputElement)?.value,
                    lastName: (document.getElementById('lastName') as HTMLInputElement)?.value,
                    email: (document.getElementById('email') as HTMLInputElement)?.value,
                    phone: (document.getElementById('phone') as HTMLInputElement)?.value,
                    address: (document.getElementById('address') as HTMLInputElement)?.value,
                    postcode: (document.getElementById('postcode') as HTMLInputElement)?.value,
                  };

                  // Add staff-specific fields if user is staff
                  if (selectedUser.type === 'staff' || selectedUser.user_type === 'staff') {
                    updateData.dateOfBirth = (document.getElementById('dateOfBirth') as HTMLInputElement)?.value;
                    updateData.experience = parseInt((document.getElementById('experience') as HTMLInputElement)?.value) || 0;
                    updateData.hourlyRate = parseFloat((document.getElementById('hourlyRate') as HTMLInputElement)?.value) || 0;
                    updateData.maxDistance = parseInt((document.getElementById('maxDistance') as HTMLInputElement)?.value) || 0;
                    updateData.preferredLocations = (document.getElementById('preferredLocations') as HTMLInputElement)?.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                    updateData.additionalSkills = (document.getElementById('additionalSkills') as HTMLInputElement)?.value;
                    updateData.previousExperience = (document.getElementById('previousExperience') as HTMLInputElement)?.value;
                    updateData.references = (document.getElementById('references') as HTMLInputElement)?.value;
                    updateData.nationalInsuranceNumber = (document.getElementById('nationalInsurance') as HTMLInputElement)?.value;
                    updateData.emergencyContactName = (document.getElementById('emergencyContactName') as HTMLInputElement)?.value;
                    updateData.emergencyContactPhone = (document.getElementById('emergencyContactPhone') as HTMLInputElement)?.value;
                    
                    // Handle select dropdowns - get the selected values from the Select components
                    // Note: This is a simplified approach - in a real implementation, you'd use proper form state management
                  }

                  // Submit the update
                  updateUserMutation.mutate(updateData);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </Card>
  );
}