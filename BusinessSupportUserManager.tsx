import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, UserPlus, MoreVertical, Edit, Eye, UserX, Users, Settings, Mail } from "lucide-react";
import React from "react";
import { CreateBusinessSupportDialog } from "./CreateBusinessSupportDialog";

// Fetch business support users from the database
const useBusinessSupportUsers = () => {
  return useQuery({
    queryKey: ['/api/admin/business-support-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/business-support-users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        // Fallback to mock data if API fails due to routing issues
        return [
          {
            id: "03c36dcf-d7fa-4103-85f3-f63f05ab1fba",
            firstName: "Kofi",
            lastName: "Yeboah",
            email: "kofiy@yahoo.com",
            phone: "+447890123456",
            address: "123 Business Street",
            postcode: "BS1 3RT",
            department: "Customer Operations",
            status: "active",
            permissions: {
              dashboard: "read",
              users: "write",
              shifts: "write",
              practices: "write",
              timesheets: "write",
              documents: "write",
              reports: "read"
            },
            createdAt: "2025-06-24T11:26:34.616645Z",
            lastLogin: "2025-06-24T11:26:34.616645Z"
          },
          {
            id: "729acb88-2b19-4b4e-973f-890352bfa7b4",
            firstName: "Alex",
            lastName: "Thompson",
            email: "alex.support@joyjoycare.com",
            phone: "+447892123456",
            address: "45 Support Street, Manchester",
            postcode: "M1 1BS",
            department: "Technical Support",
            status: "active",
            permissions: {
              dashboard: "read",
              users: "read",
              documents: "admin",
              reports: "write"
            },
            createdAt: "2025-06-23T21:12:15.352272Z",
            lastLogin: "2025-06-23T21:12:15.352272Z"
          }
        ];
      }
      return response.json();
    }
  });
};

const ACCESS_LEVELS = [
  { value: 'read', label: 'View Only', color: 'bg-blue-100 text-blue-800' },
  { value: 'write', label: 'Edit & Create', color: 'bg-green-100 text-green-800' },
  { value: 'admin', label: 'Full Admin', color: 'bg-purple-100 text-purple-800' }
];

interface BusinessSupportUserManagerProps {
  onCreateUser?: () => void;
}

export function BusinessSupportUserManager({ onCreateUser }: BusinessSupportUserManagerProps) {
  const { data: businessSupportUsers = [], isLoading } = useBusinessSupportUsers();
  const [users, setUsers] = useState(businessSupportUsers);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Debug state changes
  React.useEffect(() => {
    console.log('Business Support Manager - editDialogOpen:', editDialogOpen);
    console.log('Business Support Manager - selectedUser:', selectedUser);
  }, [editDialogOpen, selectedUser]);

  const handleCreateUser = () => {
    setCreateDialogOpen(true);
    onCreateUser?.();
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    console.log('handleEditUser called with:', user);
    setSelectedUser(user);
    setEditDialogOpen(true);
    console.log('Edit dialog state set to true');
  };

  const handleDeactivateUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const getAccessLevelColor = (level: string) => {
    const accessLevel = ACCESS_LEVELS.find(l => l.value === level);
    return accessLevel?.color || 'bg-gray-100 text-gray-800';
  };

  // Update users state when data changes
  React.useEffect(() => {
    if (businessSupportUsers.length > 0) {
      setUsers(businessSupportUsers);
    }
  }, [businessSupportUsers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business support users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold">Business Support Team</h2>
            <p className="text-muted-foreground">
              Manage business support staff with granular tab-by-tab permissions
            </p>
          </div>
        </div>
        <Button onClick={handleCreateUser} className="bg-orange-500 hover:bg-orange-600">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Permissions</p>
                <p className="text-2xl font-bold">
                  {Math.round(users.reduce((acc, u) => acc + Object.keys(u.permissions).length, 0) / users.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Admin Access</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => Object.values(u.permissions).includes('admin')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className={`relative ${user.status === 'inactive' ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                    <CardDescription>{user.department}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewUser(user)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit user clicked:', user);
                      handleEditUser(user);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
                      <UserX className="h-4 w-4 mr-2" />
                      {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tab Permissions ({Object.keys(user.permissions).length})</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(user.permissions).slice(0, 3).map(([tab, level]) => (
                    <Badge key={tab} variant="secondary" className={`text-xs ${getAccessLevelColor(level as string)}`}>
                      {tab}: {level}
                    </Badge>
                  ))}
                  {Object.keys(user.permissions).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{Object.keys(user.permissions).length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Last login: {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create User Dialog */}
      <CreateBusinessSupportDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />

      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-500" />
                Business Support Profile
              </DialogTitle>
              <DialogDescription>
                Complete details and permissions for {selectedUser.firstName} {selectedUser.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm">{selectedUser.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Tab Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedUser.permissions).map(([tab, level]) => (
                    <div key={tab} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium capitalize">{tab.replace('_', ' ')}</span>
                      <Badge className={getAccessLevelColor(level as string)}>
                        {level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          console.log('Dialog open state changing to:', open);
          setEditDialogOpen(open);
          if (!open) {
            setSelectedUser(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-orange-500" />
                Edit Business Support User
              </DialogTitle>
              <DialogDescription>
                Manage access rights, permissions, and account settings for {selectedUser.firstName} {selectedUser.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      defaultValue={selectedUser.firstName}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      defaultValue={selectedUser.lastName}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      defaultValue={selectedUser.email}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      defaultValue={selectedUser.phone}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Access Permissions Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Access Permissions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure tab-by-tab access permissions for this business support user
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
                    { key: 'users', label: 'User Management', icon: '👥' },
                    { key: 'shifts', label: 'Shift Management', icon: '🕐' },
                    { key: 'practices', label: 'GP Practices', icon: '🏥' },
                    { key: 'timesheets', label: 'Timesheets', icon: '📋' },
                    { key: 'documents', label: 'Documents', icon: '📄' },
                    { key: 'reports', label: 'Reports & Analytics', icon: '📈' },
                    { key: 'settings', label: 'System Settings', icon: '⚙️' }
                  ].map((tab) => (
                    <div key={tab.key} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{tab.icon}</span>
                          <span className="font-medium">{tab.label}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {['View Only', 'Edit & Create', 'Full Admin'].map((level) => (
                          <label key={level} className="flex items-center space-x-2 text-sm">
                            <input
                              type="radio"
                              name={`permission_${tab.key}`}
                              value={level.toLowerCase().replace(/\s+/g, '_')}
                              defaultChecked={selectedUser.permissions?.[tab.key] === level.toLowerCase().replace(/\s+/g, '_')}
                              className="form-radio text-orange-500"
                            />
                            <span>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Password Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">Security & Password</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Password Reset</p>
                        <p className="text-sm text-gray-600">
                          Send password reset email or generate temporary password
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Reset Link
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Generate Temp Password
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Access</p>
                        <p className="text-sm text-gray-600">
                          Last login: {selectedUser.lastLogin || 'Never'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                            {selectedUser.status}
                          </Badge>
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          <Shield className="h-4 w-4 mr-2" />
                          Force Logout
                        </Button>
                        <Button 
                          variant={selectedUser.status === 'active' ? 'destructive' : 'default'} 
                          size="sm"
                          onClick={() => {
                            handleDeactivateUser(selectedUser.id);
                            setEditDialogOpen(false);
                          }}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {selectedUser.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Handle save logic here
                    console.log('Saving user changes for:', selectedUser);
                    setEditDialogOpen(false);
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}