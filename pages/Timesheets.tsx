import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import StaffHeader from "@/components/StaffHeader";
import { 
  FileText, 
  Edit3, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

// Custom hours input component
function HoursInput({ value, onChange, className = "" }: { 
  value: number; 
  onChange: (value: number) => void; 
  className?: string; 
}) {
  const increment = () => {
    const newValue = Math.min(24, value + 0.5);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(0, value - 0.5);
    onChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseFloat(e.target.value) || 0;
          onChange(Math.max(0, Math.min(24, Math.round(val * 2) / 2)));
        }}
        step="0.5"
        min="0"
        max="24"
        className="pr-8"
      />
      <div className="absolute right-1 top-0 bottom-0 flex flex-col">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={increment}
          className="h-4 w-6 p-0 hover:bg-gray-100"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={decrement}
          className="h-4 w-6 p-0 hover:bg-gray-100"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Timesheet edit schema
const timesheetEditSchema = z.object({
  daily_hours: z.record(z.number().min(0).max(24))
});

type TimesheetEditData = z.infer<typeof timesheetEditSchema>;

interface Timesheet {
  id: string;
  week_start: string;
  week_end: string;
  daily_hours: Record<string, number>;
  total_hours: number;
  status: 'draft' | 'pending_manager_approval' | 'approved' | 'rejected';
  notes?: string;
  submission_date?: string;
  approval_date?: string;
  rejection_reason?: string;
  staff_name?: string;
  care_home_name?: string;
  timesheet_ref?: string;
}

export default function Timesheets() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch timesheets
  const { data: timesheets = [], isLoading } = useQuery<Timesheet[]>({
    queryKey: ['/api/timesheets'],
    retry: false
  });

  // Edit timesheet form
  const editForm = useForm<TimesheetEditData>({
    resolver: zodResolver(timesheetEditSchema),
    defaultValues: {
      daily_hours: {}
    }
  });

  // Update timesheet mutation
  const updateTimesheetMutation = useMutation({
    mutationFn: async ({ id, daily_hours }: { id: string; daily_hours: Record<string, number> }) => {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ daily_hours })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update timesheet');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timesheets'] });
      setEditingTimesheet(null);
      toast({
        title: "Success",
        description: "Timesheet updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update timesheet",
        variant: "destructive"
      });
    }
  });

  // Submit timesheet mutation
  const submitTimesheetMutation = useMutation({
    mutationFn: async (timesheetId: string) => {
      const response = await fetch(`/api/timesheets/${timesheetId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit timesheet');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timesheets'] });
      toast({
        title: "Success",
        description: "Timesheet submitted for approval"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit timesheet",
        variant: "destructive"
      });
    }
  });

  const handleEditTimesheet = (timesheet: Timesheet) => {
    setEditingTimesheet(timesheet);
    editForm.reset({
      daily_hours: timesheet.daily_hours || {}
    });
  };

  const handleSubmitEdit = (data: TimesheetEditData) => {
    if (editingTimesheet) {
      updateTimesheetMutation.mutate({
        id: editingTimesheet.id,
        daily_hours: data.daily_hours
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const getDailyHoursDisplay = (dailyHours: Record<string, number>) => {
    if (!dailyHours || Object.keys(dailyHours).length === 0) return 'No hours recorded';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workingDays = days.filter(day => dailyHours[day] && dailyHours[day] > 0);
    
    if (workingDays.length === 0) return 'No hours recorded';
    
    return workingDays.map(day => {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      return `${dayName}: ${dailyHours[day]}h`;
    }).join(', ');
  };

  // Filter timesheets
  const filteredTimesheets = timesheets.filter(timesheet => {
    if (selectedStatus === 'all') return true;
    return timesheet.status === selectedStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_manager_approval': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'pending_manager_approval': return <AlertCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader activeTab="timesheets" />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>Loading timesheets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader activeTab="timesheets" />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Timesheets</h1>
          <p className="text-gray-600 mt-1">View and manage your weekly timesheets</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All', count: timesheets.length },
          { key: 'draft', label: 'Draft', count: timesheets.filter(t => t.status === 'draft').length },
          { key: 'pending_manager_approval', label: 'Pending', count: timesheets.filter(t => t.status === 'pending_manager_approval').length },
          { key: 'approved', label: 'Approved', count: timesheets.filter(t => t.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: timesheets.filter(t => t.status === 'rejected').length }
        ].map(filter => (
          <Button
            key={filter.key}
            variant={selectedStatus === filter.key ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(filter.key)}
            className="flex items-center gap-2"
          >
            {filter.label} ({filter.count})
          </Button>
        ))}
      </div>

      {/* Timesheets list */}
      <div className="grid gap-4">
        {filteredTimesheets.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">No timesheets found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTimesheets.map((timesheet) => (
            <Card key={timesheet.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {timesheet.timesheet_ref || `Week of ${formatDate(timesheet.week_start)}`}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(timesheet.week_start)} - {formatDate(timesheet.week_end)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(timesheet.status)}>
                      {getStatusIcon(timesheet.status)}
                      <span className="ml-1 capitalize">
                        {timesheet.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Hours</p>
                      <p className="font-semibold text-lg">{timesheet.total_hours}h</p>
                    </div>
                    
                    {timesheet.submission_date && (
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-medium">{formatDate(timesheet.submission_date)}</p>
                      </div>
                    )}
                    
                    {timesheet.approval_date && (
                      <div>
                        <p className="text-gray-500">
                          {timesheet.status === 'approved' ? 'Approved' : 'Reviewed'}
                        </p>
                        <p className="font-medium">{formatDate(timesheet.approval_date)}</p>
                      </div>
                    )}
                  </div>

                  {/* Daily hours breakdown */}
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Daily Breakdown</p>
                    <p className="text-sm">{getDailyHoursDisplay(timesheet.daily_hours)}</p>
                  </div>

                  {timesheet.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-800 text-sm">
                        <strong>Rejection Reason:</strong> {timesheet.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    {timesheet.status === 'draft' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTimesheet(timesheet)}
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit Hours
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => submitTimesheetMutation.mutate(timesheet.id)}
                          disabled={submitTimesheetMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Submit for Approval
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit timesheet modal */}
      {editingTimesheet && (
        <Dialog open={true} onOpenChange={() => setEditingTimesheet(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Daily Hours</DialogTitle>
            </DialogHeader>
            
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleSubmitEdit)} className="space-y-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <FormField
                    key={day}
                    control={editForm.control}
                    name={`daily_hours.${day}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{day}</FormLabel>
                        <FormControl>
                          <HoursInput
                            value={field.value || 0}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingTimesheet(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateTimesheetMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}