import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Search,
  MoreHorizontal,
  UserPlus,
  TrendingUp,
  Edit,
  MessageSquare,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileText,
  BarChart3
} from "lucide-react";

interface ComprehensiveShiftManagementProps {
  shifts: any[];
  onRefresh: () => void;
}

export default function ComprehensiveShiftManagement({ shifts, onRefresh }: ComprehensiveShiftManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showManualAssignDialog, setShowManualAssignDialog] = useState(false);
  const [showAutoAllocationDialog, setShowAutoAllocationDialog] = useState(false);
  const [showBulkAutoAllocationDialog, setShowBulkAutoAllocationDialog] = useState(false);
  const [bulkAllocationResults, setBulkAllocationResults] = useState<any>(null);
  const [showEditShiftDialog, setShowEditShiftDialog] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [showLastReportDialog, setShowLastReportDialog] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState("");

  // Fetch available staff data from API
  const { data: availableStaff = [], isLoading: staffLoading } = useQuery({
    queryKey: ['/api/admin/staff'],
    select: (data: any) => {
      if (!Array.isArray(data)) return [];
      return data.filter((staff: any) => staff.isAvailable !== false);
    }
  });

  // Fetch last allocation report
  const { data: lastAllocationReport, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/admin/last-allocation-report'],
    enabled: showLastReportDialog,
    select: (data: any) => data || { hasReport: false }
  });

  // Manual assignment mutation with conflict checking
  const manualAssignMutation = useMutation({
    mutationFn: async ({ shiftId, staffId, notes }: any) => {
      return await apiRequest(`/api/shifts/${shiftId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ staffId, notes })
      });
    },
    onSuccess: () => {
      toast({ title: "Staff assigned successfully", description: "The shift has been manually assigned to the selected staff member." });
      setShowManualAssignDialog(false);
      setSelectedStaffId("");
      setAssignmentNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      onRefresh();
    },
    onError: (error: any) => {
      if (error.status === 409) {
        // Conflict error - show detailed conflict information
        const conflictMessage = error.conflictDetails || error.message;
        const conflicts = error.conflicts || [];
        
        toast({ 
          title: "Shift Conflict Detected", 
          description: `${conflictMessage}. Staff member already has shifts: ${conflicts.map((c: any) => c.shiftRef).join(', ')}`,
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Assignment failed", 
          description: error.message || "Could not assign staff to this shift. Please try again.",
          variant: "destructive" 
        });
      }
    }
  });

  // Auto allocation mutation
  const autoAllocateMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const response = await apiRequest(`/api/admin/shifts/${shiftId}/auto-allocate`, {
        method: 'POST'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Auto-allocation completed", description: "The fair allocation algorithm has assigned the best available staff member." });
      setShowAutoAllocationDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      onRefresh();
    }
  });

  // Bulk auto allocation mutation
  const bulkAutoAllocateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/shifts/bulk-auto-allocate', {
        method: 'POST'
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setBulkAllocationResults(data.summary);
      setShowBulkAutoAllocationDialog(true);
      
      // Handle different scenarios with user-friendly messages
      if (data.summary.totalShifts === 0) {
        toast({ 
          title: "No shifts to allocate", 
          description: "All shifts are already assigned, completed, or unfulfilled."
        });
      } else if (data.summary.noStaffReason) {
        toast({ 
          title: "No staff available", 
          description: "Please ensure staff members are registered, approved, and active.",
          variant: "destructive"
        });
      } else {
        toast({ 
          title: "Bulk allocation completed", 
          description: `${data.summary.successful} shifts assigned, ${data.summary.failed} failed.`
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      onRefresh();
    },
    onError: (error: any) => {
      toast({ 
        title: "Bulk allocation failed", 
        description: error.message || "Could not perform bulk auto-allocation. Please try again.",
        variant: "destructive" 
      });
    }
  });

  // Send SMS reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      return await apiRequest(`/api/admin/shifts/${shiftId}/send-reminder`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({ title: "SMS reminder sent", description: "Reminder notification has been sent to the assigned staff member." });
    }
  });

  // Cancel shift mutation
  const cancelShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      return await apiRequest(`/api/admin/shifts/${shiftId}/cancel`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({ title: "Shift cancelled", description: "The shift has been cancelled and returned to available pool." });
      // Force immediate refetch of shifts data
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      queryClient.refetchQueries({ queryKey: ['/api/shifts'] });
      // Also invalidate available shifts query if it exists
      queryClient.invalidateQueries({ queryKey: ['/api/available-shifts'] });
      onRefresh();
    }
  });

  // Filtering logic
  const filteredShifts = Array.isArray(shifts) ? shifts.filter((shift: any) => {
    const matchesSearch = !searchTerm || 
      shift.careHomeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.additionalNotes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'open' && shift.status === 'open') ||
      (filterStatus === 'assigned' && shift.status === 'assigned') ||
      (filterStatus === 'accepted' && shift.assignmentStatus === 'accepted') ||
      (filterStatus === 'cancelled' && shift.status === 'cancelled');
    
    const matchesRole = filterRole === 'all' || shift.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  }) : [];

  // Get available staff for assignment
  const getAvailableStaffForShift = (shift: any) => {    
    // For now, return all available staff to fix the dropdown issue
    // Role and skill matching can be implemented later
    return availableStaff;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Comprehensive Shift Management & Manual Allocation
        </CardTitle>
        <CardDescription>
          Monitor, manage, and manually allocate shifts with full administrative control
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Enhanced Filter Controls */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search by care home, role, staff, or notes..."
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
              <SelectItem value="open">Open Shifts</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
              <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
              <SelectItem value="support_worker">Support Worker</SelectItem>
              <SelectItem value="senior_carer">Senior Carer</SelectItem>
              <SelectItem value="team_leader">Team Leader</SelectItem>
              <SelectItem value="deputy_manager">Deputy Manager</SelectItem>
              <SelectItem value="activities_coordinator">Activities Coordinator</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Badge variant="outline">
              {filteredShifts.length} total shifts
            </Badge>
            <Badge variant="secondary">
              {filteredShifts.filter((s: any) => !s.assignmentStatus && s.status === 'open').length} open
            </Badge>
            <Badge className="bg-yellow-500 text-white">
              {filteredShifts.filter((s: any) => s.assignmentStatus === 'assigned').length} assigned
            </Badge>
            <Badge variant="default">
              {filteredShifts.filter((s: any) => s.assignmentStatus === 'accepted').length} accepted
            </Badge>
            <Badge variant="destructive">
              {filteredShifts.filter((s: any) => s.status === 'cancelled').length} cancelled
            </Badge>
          </div>
          <div className="ml-auto flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowLastReportDialog(true)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Last Allocation Report
            </Button>
            <Button 
              onClick={() => bulkAutoAllocateMutation.mutate()}
              disabled={bulkAutoAllocateMutation.isPending}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {bulkAutoAllocateMutation.isPending ? "Allocating..." : "Auto-Allocate All Open Shifts"}
            </Button>
          </div>
        </div>

        {/* Enhanced Shift List with Manual Allocation Controls */}
        <div className="space-y-4">
          {filteredShifts.map((shift: any) => (
            <div key={shift.id} className={`border rounded-lg p-4 transition-colors ${
              shift.assignmentStatus === 'accepted' ? 'bg-green-50 border-green-200' :
              shift.assignmentStatus === 'assigned' || shift.status === 'assigned' ? 'bg-yellow-50 border-yellow-200' :
              shift.status === 'cancelled' ? 'bg-red-50 border-red-200 opacity-75' :
              (!shift.assignmentStatus && shift.status === 'open') ? 'bg-white border-gray-200' :
              'bg-white hover:bg-gray-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Primary Shift Information */}
                  <div className="flex items-center gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{shift.role?.replace('_', ' ')}</h3>
                        {(shift.shiftRef || shift.shift_ref) && (
                          <Badge variant="secondary" className="text-xs font-mono">
                            {shift.shiftRef || shift.shift_ref}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{shift.careHomeName}</p>
                    </div>
                    {shift.assignmentStatus === 'accepted' && (shift.staffName || shift.assignedStaffName) && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Assigned to: {shift.staffName || shift.assignedStaffName}
                      </div>
                    )}
                    {shift.assignmentStatus === 'assigned' && (shift.staffName || shift.assignedStaffName) && (
                      <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        Assigned to: {shift.staffName || shift.assignedStaffName}
                      </div>
                    )}
                  </div>

                  {/* Shift Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{new Date(shift.shift_date || shift.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {(() => {
                          // Map shift types to time ranges
                          const shiftTimeMap: { [key: string]: { start: string; end: string } } = {
                            'day': { start: '07:00', end: '19:00' },
                            'evening': { start: '19:00', end: '07:00' },
                            'night': { start: '19:00', end: '07:00' }
                          };
                          const times = shiftTimeMap[shift.shiftType as keyof typeof shiftTimeMap] || { start: '07:00', end: '19:00' };
                          return `${times.start} - ${times.end}`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">£{shift.hourlyRate}/hr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      {(shift.assignmentStatus === 'assigned' || shift.assignmentStatus === 'accepted') && (shift.staffName || shift.assignedStaffName) ? (
                        <span className="text-sm font-medium text-blue-600">
                          {shift.staffName || shift.assignedStaffName}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {shift.staffRequired || 1} staff needed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Required Skills Display */}
                  {shift.requiredSkills && shift.requiredSkills.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {shift.requiredSkills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {shift.additionalNotes && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Additional Notes:</h4>
                      <p className="text-sm text-gray-600">{shift.additionalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Action Controls and Status */}
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-2">
                    <Badge variant={
                      shift.assignmentStatus === 'accepted' ? 'default' : 
                      shift.assignmentStatus === 'assigned' ? 'secondary' : 
                      shift.status === 'assigned' ? 'secondary' : 
                      shift.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }>
                      {shift.assignmentStatus === 'accepted' ? 'ACCEPTED' :
                       shift.assignmentStatus === 'assigned' ? 'ASSIGNED' :
                       shift.status === 'assigned' ? 'ASSIGNED' : 
                       shift.status === 'cancelled' ? 'CANCELLED' : 'OPEN'}
                    </Badge>
                    {shift.staffRequired > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Batch Request
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
                      {(shift.status === 'open' || !shift.assignmentStatus || shift.assignmentStatus === 'assigned') && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            console.log('Manual assignment selected shift data:', shift);
                            setSelectedShift(shift);
                            setShowManualAssignDialog(true);
                          }}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Manual Assign to Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedShift(shift);
                            setShowAutoAllocationDialog(true);
                          }}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Run Auto-Allocation
                          </DropdownMenuItem>
                        </>
                      )}
                      {shift.status === 'assigned' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedShift(shift);
                            setShowManualAssignDialog(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Change Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            sendReminderMutation.mutate(shift.id);
                          }}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Reminder SMS
                          </DropdownMenuItem>
                        </>
                      )}
                      {shift.assignmentStatus === 'accepted' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            setSelectedShift(shift);
                            // Open staff details dialog
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Staff Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            sendReminderMutation.mutate(shift.id);
                          }}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Update SMS
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => {
                        setSelectedShift(shift);
                        setShowEditShiftDialog(true);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Shift Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Export Shift Data
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this shift?')) {
                            cancelShiftMutation.mutate(shift.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Shift
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Assignment Timeline for Assigned/Accepted Shifts */}
              {shift.status !== 'open' && (shift.status === 'assigned' || shift.assignmentStatus === 'accepted' || (shift.staffName || shift.assignedStaffName)) && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Assignment Timeline:</h4>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {(shift.assignedAt || shift.createdAt) && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Assigned: {new Date(shift.assignedAt || shift.createdAt).toLocaleString()}</span>
                      </div>
                    )}
                    {shift.responseAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Accepted: {new Date(shift.responseAt).toLocaleString()}</span>
                      </div>
                    )}
                    {shift.assignmentStatus === 'accepted' && !shift.responseAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Status: Accepted</span>
                      </div>
                    )}
                    {shift.timeoutAt && !shift.responseAt && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span>Timeout: {new Date(shift.timeoutAt).toLocaleString()}</span>
                      </div>
                    )}
                    {(shift.staffName || shift.assignedStaffName) && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="font-medium">Staff: {shift.staffName || shift.assignedStaffName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredShifts.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
              <p className="text-gray-500">No shifts match your current filter criteria.</p>
            </div>
          )}
        </div>

        {/* Manual Assignment Dialog */}
        <Dialog open={showManualAssignDialog} onOpenChange={setShowManualAssignDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manual Staff Assignment</DialogTitle>
              <DialogDescription>
                Assign a staff member to {selectedShift?.role?.replace('_', ' ')} at {selectedShift?.careHomeName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Shift Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Shift Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Date: {selectedShift && new Date(selectedShift.shift_date || selectedShift.date).toLocaleDateString()}</div>
                  <div>Time: {selectedShift?.shift_type === 'day' ? '07:00 - 19:00' : 
                              selectedShift?.shift_type === 'evening' ? '19:00 - 23:00' : 
                              selectedShift?.shift_type === 'night' ? '23:00 - 07:00' : 
                              `${selectedShift?.start_time || ''} - ${selectedShift?.end_time || ''}`}</div>
                  <div>Rate: £{selectedShift?.hourly_rate || '16.50'}/hr</div>
                  <div>Location: {selectedShift?.careHomeName || 'Care Home'}</div>
                </div>
                {selectedShift?.requiredSkills && selectedShift.requiredSkills.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">Required Skills: </span>
                    {selectedShift.requiredSkills.join(', ')}
                  </div>
                )}
              </div>

              {/* Staff Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Staff Member</label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStaffForShift(selectedShift || {}).map((staff: any) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{staff.firstName} {staff.lastName}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              {staff.role?.replace('_', ' ')}
                            </Badge>
                            {staff.skills && staff.skills.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {staff.skills.length} skills
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignment Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Assignment Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this assignment..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualAssignDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedStaffId && selectedShift) {
                      manualAssignMutation.mutate({
                        shiftId: selectedShift.id,
                        staffId: selectedStaffId,
                        notes: assignmentNotes
                      });
                    }
                  }}
                  disabled={!selectedStaffId || manualAssignMutation.isPending}
                >
                  {manualAssignMutation.isPending ? 'Assigning...' : 'Assign Staff'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auto Allocation Dialog */}
        <Dialog open={showAutoAllocationDialog} onOpenChange={setShowAutoAllocationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Auto-Allocation System</DialogTitle>
              <DialogDescription>
                Run the fair allocation algorithm for {selectedShift?.role?.replace('_', ' ')} at {selectedShift?.careHomeName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Algorithm Details</h4>
                <ul className="text-sm space-y-1">
                  <li>• 35% Workload balancing (recent shift count)</li>
                  <li>• 30% Rotation fairness (last assignment date)</li>
                  <li>• 20% Proximity matching (distance to facility)</li>
                  <li>• 15% Experience matching (skill compatibility)</li>
                </ul>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAutoAllocationDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedShift) {
                      autoAllocateMutation.mutate(selectedShift.id);
                    }
                  }}
                  disabled={autoAllocateMutation.isPending}
                >
                  {autoAllocateMutation.isPending ? 'Running...' : 'Run Auto-Allocation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Auto-Allocation Results Dialog */}
        <Dialog open={showBulkAutoAllocationDialog} onOpenChange={setShowBulkAutoAllocationDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Bulk Auto-Allocation Results
              </DialogTitle>
              <DialogDescription>
                Summary of automatic staff allocation across all care facilities
              </DialogDescription>
            </DialogHeader>
            
            {bulkAllocationResults && (
              <div className="space-y-6">
                {/* Special case: No shifts available */}
                {bulkAllocationResults.totalShifts === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                      <div className="text-amber-600 text-lg font-medium mb-2">
                        No Open Shifts Available
                      </div>
                      <p className="text-amber-700 text-sm">
                        All shifts are currently assigned, completed, or marked as unfulfilled. 
                        Create new shifts or check for cancelled shifts that can be reopened.
                      </p>
                    </div>
                  </div>
                ) : bulkAllocationResults.noStaffReason ? (
                  <div className="text-center py-8">
                    <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                      <div className="text-red-600 text-lg font-medium mb-2">
                        No Staff Available for Assignment
                      </div>
                      <p className="text-red-700 text-sm">
                        No approved, active staff members found. Please ensure staff are registered, 
                        approved, and have active status before running auto-allocation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{bulkAllocationResults.totalShifts}</div>
                    <div className="text-sm text-blue-600">Total Shifts</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{bulkAllocationResults.successful}</div>
                    <div className="text-sm text-green-600">Successfully Assigned</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{bulkAllocationResults.failed}</div>
                    <div className="text-sm text-red-600">Failed Assignments</div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h4 className="font-medium">Allocation Details</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {bulkAllocationResults.details?.map((detail: any, index: number) => (
                      <div 
                        key={index}
                        className={`border rounded-lg p-3 ${
                          detail.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {detail.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <div className="font-medium">
                                {detail.shiftRef} - {detail.careHome}
                              </div>
                              <div className="text-sm text-gray-600">
                                {detail.shiftType} shift on {new Date(detail.shiftDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {detail.status === 'success' ? (
                              <div>
                                <div className="font-medium text-green-700">{detail.assignedTo}</div>
                                <div className="text-xs text-green-600">Score: {detail.score?.toFixed(1)}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-red-600">{detail.reason}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                    <div className="flex justify-end">
                      <Button onClick={() => setShowBulkAutoAllocationDialog(false)}>
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Last Allocation Report Dialog */}
        <Dialog open={showLastReportDialog} onOpenChange={setShowLastReportDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Last Allocation Report
              </DialogTitle>
              <DialogDescription>
                Summary of the most recent bulk auto-allocation run
              </DialogDescription>
            </DialogHeader>
            
            {reportLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading allocation report...</p>
                </div>
              </div>
            ) : !lastAllocationReport?.hasReport ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Allocation Reports Available</h3>
                <p className="text-sm text-muted-foreground">
                  Run the bulk auto-allocation to generate your first report.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Report Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{lastAllocationReport.report.total_shifts}</div>
                    <div className="text-sm text-muted-foreground">Total Shifts</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{lastAllocationReport.report.successful_allocations}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{lastAllocationReport.report.failed_allocations}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {Math.round((lastAllocationReport.report.successful_allocations / lastAllocationReport.report.total_shifts) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Run by: {lastAllocationReport.report.runBy}</span>
                    <span>Date: {lastAllocationReport.report.formattedTimestamp}</span>
                  </div>
                  
                  {lastAllocationReport.report.allocation_details && lastAllocationReport.report.allocation_details.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Allocation Details</h4>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {lastAllocationReport.report.allocation_details.map((detail: any, index: number) => (
                          <div key={index} className={`p-3 rounded-lg border ${
                            detail.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-red-50 dark:bg-red-900/20 border-red-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {detail.shiftRef || detail.shiftId} - {detail.careHome}
                              </div>
                              <Badge variant={detail.status === 'success' ? 'default' : 'destructive'}>
                                {detail.status === 'success' ? 'Assigned' : 'Failed'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {detail.shiftDate} - {detail.shiftType}
                            </div>
                            {detail.status === 'success' && detail.assignedStaff && (
                              <div className="text-sm font-medium text-green-700 dark:text-green-300 mt-1">
                                Assigned to: {detail.assignedStaff}
                              </div>
                            )}
                            {detail.status === 'failed' && detail.reason && (
                              <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                Reason: {detail.reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}