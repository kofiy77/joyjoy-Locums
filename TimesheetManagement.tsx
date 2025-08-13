import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Timesheet {
  id: string;
  staffId: string;
  careHomeId: string;
  weekStart: string;
  weekEnd: string;
  dailyHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  totalHours: string;
  status: 'draft' | 'pending_manager_approval' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvedNotes?: string;
  createdAt: string;
  updatedAt: string;
  staff_name?: string;
  staff_email?: string;
  care_home_name?: string;
  care_homes?: { name: string; address: string };
  user_profiles?: { first_name: string; last_name: string; email: string };
}

interface TimesheetManagementProps {
  userType: 'staff' | 'care_home' | 'admin';
  userId: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_manager_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const statusLabels = {
  draft: 'Draft',
  pending_manager_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected'
};

export default function TimesheetManagement({ userType, userId }: TimesheetManagementProps) {
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch timesheets based on user type
  const timesheetsEndpoint = userType === 'admin' ? '/api/admin/timesheets' : '/api/timesheets';
  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: [timesheetsEndpoint],
    retry: false,
  });

  // Fetch care homes for staff timesheet creation
  const { data: careHomes = [] } = useQuery({
    queryKey: ['/api/care-homes'],
    enabled: userType === 'staff',
    retry: false,
  });

  // Create/update timesheet mutation
  const createTimesheetMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/timesheets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [timesheetsEndpoint] });
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: "Timesheet saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save timesheet",
        variant: "destructive",
      });
    },
  });

  // Submit timesheet mutation
  const submitTimesheetMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      return apiRequest(`/api/timesheets/${timesheetId}/submit`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [timesheetsEndpoint] });
      toast({
        title: "Success",
        description: "Timesheet submitted for approval",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit timesheet",
        variant: "destructive",
      });
    },
  });

  // Review timesheet mutation (for managers)
  const reviewTimesheetMutation = useMutation({
    mutationFn: async ({ timesheetId, action, notes }: { timesheetId: string; action: 'approve' | 'reject'; notes?: string }) => {
      return apiRequest(`/api/timesheets/${timesheetId}/review`, {
        method: 'POST',
        body: { action, notes }, // Remove JSON.stringify - apiRequest handles this
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [timesheetsEndpoint] });
      setSelectedTimesheet(null);
      toast({
        title: "Success",
        description: "Timesheet reviewed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review timesheet",
        variant: "destructive",
      });
    },
  });

  const getWeekDates = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString(),
      end: end.toLocaleDateString()
    };
  };

  const getCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Timesheet Management</h2>
        {userType === 'staff' && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Timesheet
          </Button>
        )}
      </div>

      {/* Create timesheet form */}
      {showCreateForm && userType === 'staff' && (
        <TimesheetForm
          careHomes={careHomes}
          onSubmit={(data) => createTimesheetMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createTimesheetMutation.isPending}
        />
      )}

      {/* Timesheets list */}
      <div className="grid gap-4">
        {timesheets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">No timesheets found</p>
            </CardContent>
          </Card>
        ) : (
          timesheets.map((timesheet: Timesheet) => (
            <TimesheetCard
              key={timesheet.id}
              timesheet={timesheet}
              userType={userType}
              onSubmit={(id) => submitTimesheetMutation.mutate(id)}
              onReview={(id, action, notes) => reviewTimesheetMutation.mutate({ timesheetId: id, action, notes })}
              onEdit={setSelectedTimesheet}
              isSubmitting={submitTimesheetMutation.isPending}
              isReviewing={reviewTimesheetMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Edit timesheet modal */}
      {selectedTimesheet && (
        <TimesheetEditModal
          timesheet={selectedTimesheet}
          careHomes={careHomes}
          onSave={(data) => createTimesheetMutation.mutate(data)}
          onClose={() => setSelectedTimesheet(null)}
          isLoading={createTimesheetMutation.isPending}
        />
      )}
    </div>
  );
}

// Timesheet creation form component
function TimesheetForm({ careHomes, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState(() => {
    const currentWeek = getCurrentWeek();
    return {
      weekStart: currentWeek.start,
      weekEnd: currentWeek.end,
      careHomeId: '',
      dailyHours: {
        monday: '0',
        tuesday: '0',
        wednesday: '0',
        thursday: '0',
        friday: '0',
        saturday: '0',
        sunday: '0'
      }
    };
  });

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayHoursChange = (day: string, hours: string) => {
    const numericHours = hours.replace(/[^0-9.]/g, '');
    setFormData(prev => ({
      ...prev,
      dailyHours: {
        ...prev.dailyHours,
        [day]: numericHours
      }
    }));
  };

  const totalHours = Object.values(formData.dailyHours).reduce((sum, hours) => {
    return sum + parseFloat(hours || '0');
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.careHomeId) {
      return;
    }
    onSubmit(formData);
  };

  function getCurrentWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Timesheet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Week Start</label>
              <Input
                type="date"
                value={formData.weekStart}
                onChange={(e) => setFormData(prev => ({ ...prev, weekStart: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Week End</label>
              <Input
                type="date"
                value={formData.weekEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, weekEnd: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Care Home</label>
              <Select value={formData.careHomeId} onValueChange={(value) => setFormData(prev => ({ ...prev, careHomeId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select care home" />
                </SelectTrigger>
                <SelectContent>
                  {careHomes.map((home: any) => (
                    <SelectItem key={home.id} value={home.id}>
                      {home.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Daily Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {Object.entries(dayLabels).map(([day, label]) => (
                <div key={day}>
                  <label className="block text-sm font-medium mb-2">{label}</label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.dailyHours[day as keyof typeof formData.dailyHours]}
                    onChange={(e) => handleDayHoursChange(day, e.target.value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-900">
                Total Hours: {totalHours.toFixed(1)} hours
                {totalHours > 40 && (
                  <span className="ml-2 text-amber-600">
                    ({(totalHours - 40).toFixed(1)} overtime hours)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || !formData.careHomeId}>
              {isLoading ? 'Saving...' : 'Save Timesheet'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Individual timesheet card component
function TimesheetCard({ timesheet, userType, onSubmit, onReview, onEdit, isSubmitting, isReviewing }: any) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Safe date formatting with proper field mapping
  const getWeekDates = () => {
    try {
      // Use actual database field names: weekStart or week_start
      const startDateStr = timesheet.weekStart || timesheet.week_start;
      const endDateStr = timesheet.weekEnd || timesheet.week_end;
      
      if (!startDateStr || !endDateStr) {
        return { start: "No Date", end: "No Date" };
      }
      
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { start: "Invalid Date", end: "Invalid Date" };
      }
      
      return {
        start: start.toLocaleDateString(),
        end: end.toLocaleDateString()
      };
    } catch (e) {
      return { start: "Error", end: "Error" };
    }
  };

  const weekDates = getWeekDates();
  
  // Calculate total hours with fallback calculation
  const getTotalHours = () => {
    let savedTotal = parseFloat(timesheet.totalHours || '0');
    
    if (savedTotal === 0 && (timesheet.dailyHours || timesheet.daily_hours)) {
      // Calculate from daily hours if total is 0
      const dailyHours = timesheet.dailyHours || timesheet.daily_hours || {};
      savedTotal = Object.values(dailyHours).reduce((sum: number, hours: any) => 
        sum + (parseFloat(hours) || 0), 0);
    }
    
    return savedTotal;
  };
  
  const totalHours = getTotalHours();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending_manager_approval':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };





  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                Week of {weekDates.start} - {weekDates.end}
              </h3>
              {timesheet.timesheetRef && (
                <Badge variant="outline" className="text-xs">
                  {timesheet.timesheetRef}
                </Badge>
              )}
            </div>
            {userType !== 'staff' && (
              <p className="text-sm text-gray-600">
                Staff: {timesheet.staffName || timesheet.staff_name || `${timesheet.user_profiles?.first_name} ${timesheet.user_profiles?.last_name}` || 'Unknown Staff'}
              </p>
            )}
            {userType === 'admin' && (
              <p className="text-sm text-gray-600">
                Care Home: {timesheet.careHomeName || timesheet.care_home_name || timesheet.care_homes?.name || 'Unknown Care Home'}
              </p>
            )}
          </div>
          <Badge className={`flex items-center gap-1 ${statusColors[timesheet.status]}`}>
            {getStatusIcon(timesheet.status)}
            {statusLabels[timesheet.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-xl font-semibold">{totalHours.toFixed(1)}</p>
          </div>
          {totalHours > 40 && (
            <div>
              <p className="text-sm text-gray-600">Overtime</p>
              <p className="text-xl font-semibold text-amber-600">{(totalHours - 40).toFixed(1)}</p>
            </div>
          )}
          {timesheet.submittedAt && (
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-sm">{new Date(timesheet.submittedAt).toLocaleDateString()}</p>
            </div>
          )}
          {timesheet.approvedAt && (
            <div>
              <p className="text-sm text-gray-600">
                {timesheet.status === 'approved' ? 'Approved' : 'Rejected'}
              </p>
              <p className="text-sm">{new Date(timesheet.approvedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Daily hours breakdown */}
        {timesheet.dailyHours || timesheet.daily_hours ? (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Daily Hours</p>
            <div className="grid grid-cols-7 gap-2 text-xs">
              {Object.entries(timesheet.dailyHours || timesheet.daily_hours || {}).map(([day, hours]) => (
                <div key={day} className="text-center">
                  <p className="font-medium capitalize">{day.slice(0, 3)}</p>
                  <p className="text-gray-600">{hours}h</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Approval notes */}
        {timesheet.approvedNotes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium mb-1">Manager Notes</p>
            <p className="text-sm text-gray-700">{timesheet.approvedNotes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {userType === 'staff' && timesheet.status === 'draft' && (
            <>
              <Button size="sm" onClick={() => onEdit(timesheet)}>
                Edit
              </Button>
              <Button size="sm" onClick={() => onSubmit(timesheet.id)} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </>
          )}
          
          {(userType === 'care_home' || userType === 'admin') && timesheet.status === 'pending_manager_approval' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setShowReviewForm(true)}>
                Review
              </Button>
            </div>
          )}
        </div>

        {/* Review form */}
        {showReviewForm && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h4 className="font-medium mb-3">Review Timesheet</h4>
            <Textarea
              placeholder="Add notes (optional)"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="mb-3"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  onReview(timesheet.id, 'approve', reviewNotes);
                  setShowReviewForm(false);
                  setReviewNotes('');
                }}
                disabled={isReviewing}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onReview(timesheet.id, 'reject', reviewNotes);
                  setShowReviewForm(false);
                  setReviewNotes('');
                }}
                disabled={isReviewing}
                variant="destructive"
              >
                Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Edit timesheet modal component
function TimesheetEditModal({ timesheet, careHomes, onSave, onClose, isLoading }: any) {
  const [formData, setFormData] = useState({
    weekStart: timesheet.weekStart,
    weekEnd: timesheet.weekEnd,
    careHomeId: timesheet.careHomeId,
    dailyHours: { ...timesheet.dailyHours }
  });

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  const handleDayHoursChange = (day: string, hours: string) => {
    const numericHours = hours.replace(/[^0-9.]/g, '');
    setFormData(prev => ({
      ...prev,
      dailyHours: {
        ...prev.dailyHours,
        [day]: numericHours
      }
    }));
  };

  const totalHours = Object.values(formData.dailyHours).reduce((sum, hours) => {
    return sum + parseFloat(hours || '0');
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Timesheet</h2>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Week Start</label>
                <Input
                  type="date"
                  value={formData.weekStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, weekStart: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Week End</label>
                <Input
                  type="date"
                  value={formData.weekEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, weekEnd: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Care Home</label>
                <Select value={formData.careHomeId} onValueChange={(value) => setFormData(prev => ({ ...prev, careHomeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select care home" />
                  </SelectTrigger>
                  <SelectContent>
                    {careHomes.map((home: any) => (
                      <SelectItem key={home.id} value={home.id}>
                        {home.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Daily Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <div key={day}>
                    <label className="block text-sm font-medium mb-2">{label}</label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={formData.dailyHours[day as keyof typeof formData.dailyHours]}
                      onChange={(e) => handleDayHoursChange(day, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  Total Hours: {totalHours.toFixed(1)} hours
                  {totalHours > 40 && (
                    <span className="ml-2 text-amber-600">
                      ({(totalHours - 40).toFixed(1)} overtime hours)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}