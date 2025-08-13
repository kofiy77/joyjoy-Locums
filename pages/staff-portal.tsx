import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  Timer, 
  FileText,
  UserCheck, 
  Activity, 
  AlertCircle, 
  Users,
  Star,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import MyDiary from "./MyDiary";
import StaffHeader from '@/components/StaffHeader';
import MyShiftsRedesigned from '@/components/MyShiftsRedesigned';
import AvailableShifts from './AvailableShifts';
import careHomeEnvironment from "../assets/care-home-environment.jpg";

// Helper functions
function formatDate(date: Date): string {
  return format(date, "EEE, MMM d, yyyy");
}

function getShiftTimes(shiftType: string): { start: string; end: string } {
  const shiftTimes: { [key: string]: { start: string; end: string } } = {
    'day': { start: '07:00', end: '19:00' },
    'evening': { start: '19:00', end: '23:00' },
    'night': { start: '23:00', end: '07:00' }
  };
  return shiftTimes[shiftType] || { start: '09:00', end: '17:00' };
}

function getShiftType(startTime?: string): string {
  if (!startTime) return 'day';
  const hour = parseInt(startTime.split(':')[0]);
  if (hour >= 7 && hour < 19) return 'day';
  if (hour >= 19 && hour < 23) return 'evening';
  return 'night';
}

// Validation schemas
const cancelShiftSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  details: z.string().optional(),
});

// Confirmation dialog component  
function ShiftConfirmationDialog({ shift, isOpen, onClose, onConfirm }: {
  shift: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Shift Selection</DialogTitle>
          <DialogDescription>
            Please review the shift details before confirming your acceptance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-3">
            <div>
              <p className="text-muted-foreground text-sm">Position</p>
              <p className="font-medium">{shift.role}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm">Date & Time</p>
              <p className="font-medium">{formatDate(new Date(shift.date))} • {shift.timeSlot || 'Full Day'}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm">Location</p>
              <p className="font-medium">{shift.practiceName}</p>
              <p className="text-sm text-muted-foreground">{shift.practiceAddress}</p>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm">Compensation</p>
              <p className="font-medium">£{shift.hourlyRate}/hour • £{shift.totalAmount} total</p>
            </div>
            
            {shift.specialtyRequirements && shift.specialtyRequirements.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm">Specialty Requirements</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {shift.specialtyRequirements.map((req: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              By accepting this shift, you confirm your availability and commitment to work these hours.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
            Yes, Accept Shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Cancellation dialog component
function CancelShiftDialog({ shift, isOpen, onClose, onCancel }: {
  shift: any;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (data: { reason: string; details?: string }) => void;
}) {
  const form = useForm<z.infer<typeof cancelShiftSchema>>({
    resolver: zodResolver(cancelShiftSchema),
    defaultValues: {
      reason: "",
      details: "",
    },
  });

  const selectedReason = form.watch("reason");

  const onSubmit = (values: z.infer<typeof cancelShiftSchema>) => {
    onCancel({
      reason: values.reason,
      details: values.details || undefined,
    });
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Shift</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling your shift on {new Date(shift?.date).toLocaleDateString()} 
            from {(() => {
              const times = getShiftTimes(shift?.shift_type || 'day');
              return `${times.start} to ${times.end}`;
            })()}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sickness">Sickness</SelectItem>
                      <SelectItem value="family_emergency">Family Emergency</SelectItem>
                      <SelectItem value="transport_issues">Transport Issues</SelectItem>
                      <SelectItem value="personal_emergency">Personal Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === "other" && (
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Explanation</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide a brief explanation..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Keep Shift
              </Button>
              <Button type="submit" variant="destructive">
                Cancel Shift
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TrainingVideos() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Fetch published training videos from API
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['/api/videos/published'],
    select: (data: any) => Array.isArray(data) ? data.filter((video: any) => video.status === 'published') : []
  });

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <img 
          src={careHomeEnvironment} 
          alt="Professional care home environment" 
          className="w-full max-w-md h-48 object-cover rounded-lg shadow-lg"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Videos</h2>
        
        {videosLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading training content...</p>
          </div>
        ) : videos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Videos Available</h3>
              <p className="text-gray-600">Training content will be available here once published by administrators.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video: any) => (
              <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleVideoClick(video)}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{video.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{video.duration || '5 min'}</span>
                    <Badge variant="outline">{video.category || 'General'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>{selectedVideo?.description}</DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Video player would be implemented here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StaffProfile() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">My Profile</h2>
        <p className="text-gray-600">Manage your personal information and account settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Profile management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// HoursInput component for timesheet hours
function HoursInput({ value, onChange, className }: { value: number; onChange: (value: number) => void; className?: string }) {
  const increment = () => {
    const newValue = Math.min(24, value + 0.5);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(0, value - 0.5);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={value <= 0}
        className="h-8 w-8 p-0"
      >
        -
      </Button>
      <Input
        type="number"
        step="0.5"
        min="0"
        max="24"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={value >= 24}
        className="h-8 w-8 p-0"
      >
        +
      </Button>
    </div>
  );
}

function Timesheets() {
  const [editingTimesheet, setEditingTimesheet] = useState<any>(null);
  const [dailyHours, setDailyHours] = useState<{ [key: string]: number }>({});

  const { data: timesheets, isLoading } = useQuery({
    queryKey: ['/api/timesheets'],
    select: (data: any) => Array.isArray(data) ? data : []
  });

  const updateTimesheetMutation = useMutation({
    mutationFn: async (data: { id: string; dailyHours: { [key: string]: number } }) => {
      const response = await apiRequest(`/api/timesheets/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({ dailyHours: data.dailyHours }),
      });
      return response.json();
    }
  });

  const handleEditTimesheet = (timesheet: any) => {
    setEditingTimesheet(timesheet);
    setDailyHours(timesheet.dailyHours || {});
  };

  const handleSaveTimesheet = () => {
    if (editingTimesheet) {
      updateTimesheetMutation.mutate({
        id: editingTimesheet.id,
        dailyHours: dailyHours
      });
      setEditingTimesheet(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading timesheets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">My Timesheets</h2>
        <p className="text-gray-600">Track and submit your work hours</p>
      </div>

      {timesheets?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timesheets</h3>
            <p className="text-gray-600">Your timesheets will appear here once you start working shifts.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {timesheets?.map((timesheet: any) => (
            <Card key={timesheet.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Week of {new Date(timesheet.weekStart).toLocaleDateString()}
                  </CardTitle>
                  <Badge variant={timesheet.status === 'approved' ? 'default' : 'secondary'}>
                    {timesheet.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Total Hours:</strong> {timesheet.totalHours}</p>
                  <p><strong>Status:</strong> {timesheet.status}</p>
                  {timesheet.status === 'draft' && (
                    <Button onClick={() => handleEditTimesheet(timesheet)} className="mt-2">
                      Edit Timesheet
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Timesheet Dialog */}
      <Dialog open={!!editingTimesheet} onOpenChange={() => setEditingTimesheet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timesheet</DialogTitle>
            <DialogDescription>
              Update your daily hours for the week of {new Date(editingTimesheet?.weekStart || '').toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <TimesheetEditForm
            dailyHours={dailyHours}
            setDailyHours={setDailyHours}
            isPending={updateTimesheetMutation.isPending}
            onSave={handleSaveTimesheet}
            onCancel={() => setEditingTimesheet(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimesheetEditForm({ dailyHours, setDailyHours, isPending, onSave, onCancel }: {
  dailyHours: { [key: string]: number };
  setDailyHours: (hours: { [key: string]: number }) => void;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const totalHours = Object.values(dailyHours).reduce((sum, hours) => sum + (hours || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {days.map((day) => (
          <div key={day} className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize">{day}</label>
            <HoursInput
              value={dailyHours[day] || 0}
              onChange={(value) => setDailyHours(prev => ({
                ...prev,
                [day]: value
              }))}
              className="mt-1"
            />
          </div>
        ))}
      </div>

      <div className="text-sm font-medium text-gray-700 pt-2 border-t">
        Total Hours: {totalHours}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? "Updating..." : "Update Timesheet"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function MyShifts() {
  return <MyShiftsRedesigned />;
}



export default function StaffPortal() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    switch (location) {
      case '/available-shifts': return 'available-shifts';
      case '/my-shifts': return 'my-shifts';
      case '/timesheets': return 'timesheets';
      case '/training-videos': return 'training-videos';
      case '/profile': return 'profile';
      case '/my-diary': return 'my-diary';
      case '/compliance': return 'compliance';
      default: return 'my-diary'; // Default to my-diary instead of profile
    }
  });

  // Fetch user profile status to check if active
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user/profile-status'],
    enabled: true
  });

  const isInactive = userProfile && !((userProfile as any)?.isActive === true);

  const handleTabChange = (value: string) => {
    // Restrict navigation for inactive users
    if (isInactive && value !== 'profile') {
      // Inactive users can only access profile tab
      return;
    }
    setActiveTab(value);
    switch (value) {
      case 'available-shifts': navigate('/available-shifts'); break;
      case 'my-shifts': navigate('/my-shifts'); break;
      case 'timesheets': navigate('/timesheets'); break;
      case 'training-videos': navigate('/training-videos'); break;
      case 'profile': navigate('/profile'); break;
      case 'my-diary': navigate('/my-diary'); break;
      case 'compliance': navigate('/compliance'); break;
      default: navigate(isInactive ? '/profile' : '/my-diary'); break;
    }
  };

  const getCurrentView = () => {
    switch (activeTab) {
      case 'available-shifts': return <AvailableShifts />;
      case 'my-shifts': return <MyShifts />;
      case 'timesheets': return <Timesheets />;
      case 'training-videos': return <TrainingVideos />;
      case 'profile': return <StaffProfile />;
      case 'my-diary': return <MyDiary />;
      case 'compliance': return <div className="text-center py-8"><p className="text-gray-600">Access compliance documents through your profile.</p></div>;
      default: return <MyDiary />;
    }
  };
  
  const getTitle = () => {
    switch (activeTab) {
      case 'available-shifts': return 'Available Shifts';
      case 'my-shifts': return 'My Shifts';
      case 'timesheets': return 'Timesheets';
      case 'training-videos': return 'Training Videos';
      case 'profile': return 'My Profile';
      case 'my-diary': return 'My Diary';
      default: return 'My Diary';
    }
  };
  
  const getDescription = () => {
    switch (activeTab) {
      case 'available-shifts': return 'Browse and apply for available shifts';
      case 'my-shifts': return 'View your scheduled and completed shifts';
      case 'timesheets': return 'Submit and track your work hours';
      case 'training-videos': return 'Access training materials and educational videos';
      case 'profile': return 'Manage your profile, availability, and certifications';
      case 'my-diary': return 'View your scheduled shifts in calendar or list format';
      default: return 'View your scheduled shifts in calendar or list format';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isInactive={!!isInactive}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Inactive User Status Banner */}
        {isInactive ? (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="text-orange-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-800">Account Pending Activation</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Your account is currently inactive. You can update your profile and upload required documents. 
                  An admin will activate your account once your documents are reviewed and approved.
                </p>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Content Area - No additional navigation elements */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
              <p className="text-gray-600">{getDescription()}</p>
            </div>
          </div>
        </div>

        {/* Current View - Directly rendered without tabs */}
        <div className="space-y-6">
          <div className="max-w-4xl">
            {getCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
}