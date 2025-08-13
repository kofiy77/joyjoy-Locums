import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StaffProfile from "@/components/staff-profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ShiftDetailModal from "@/components/ShiftDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, X, FileText, ChevronUp, ChevronDown, MapPin, Play, Edit3, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Removed DropdownMenu - no longer needed since navigation is in header
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import MyDiary from "./MyDiary";
import StaffHeader from '@/components/StaffHeader';
import MyShiftsRedesigned from '@/components/MyShiftsRedesigned';
import AvailableShifts from './AvailableShifts';
import careHomeEnvironment from "../assets/care-home-environment.jpg";

// Custom hours input component with up/down arrows for 0.5 increments
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) return;
    
    // Round to nearest 0.5
    const rounded = Math.round(numValue * 2) / 2;
    const clamped = Math.max(0, Math.min(24, rounded));
    onChange(clamped);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
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

// Cancellation form schema
const cancelShiftSchema = z.object({
  reason: z.string().min(1, "Please select a cancellation reason"),
  details: z.string().optional(),
});

// Utility function to derive shift type from start time
const getShiftType = (startTime: string) => {
  if (!startTime) return 'day';
  const hour = parseInt(startTime.split(':')[0]);
  if (hour >= 7 && hour < 19) return 'day';
  if (hour >= 19 && hour < 23) return 'evening';
  return 'night';
};

// Utility function to get shift times based on shift type
const getShiftTimes = (shiftType: string) => {
  const shiftTimeMap: { [key: string]: { start: string; end: string; duration: number } } = {
    'day': { start: '07:00', end: '19:00', duration: 12 },
    'evening': { start: '19:00', end: '07:00', duration: 12 },
    'night': { start: '19:00', end: '07:00', duration: 12 }
  };
  return shiftTimeMap[shiftType as keyof typeof shiftTimeMap] || { start: '00:00', end: '00:00', duration: 8 };
};

// Shift confirmation dialog component
function ShiftConfirmationDialog({ shift, isOpen, onClose, onConfirm }: {
  shift: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!shift) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  const calculateShiftHours = () => {
    const times = getShiftTimes(shift.shift_type);
    return times.duration;
  };

  const shiftHours = calculateShiftHours();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Confirm Shift Selection
          </DialogTitle>
          <DialogDescription>
            Please confirm you want to accept this shift
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{shift.role}</h3>
              <Badge variant="outline">{shift.shiftRef}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(shift.shiftDate || shift.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{shiftHours} hours</p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">{getShiftTimes(shift.shift_type).start} - {getShiftTimes(shift.shift_type).end}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rate</p>
                <p className="font-medium">£{shift.hourlyRate || shift.hourly_rate}/hour</p>
              </div>
            </div>
            
            <div>
              <p className="text-muted-foreground text-sm">Care Home</p>
              <p className="font-medium">{shift.careHomeName || shift.care_home_name}</p>
            </div>
            
            {(shift.requiredSkills || shift.required_skills) && (shift.requiredSkills || shift.required_skills).length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm">Required Skills</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(shift.requiredSkills || shift.required_skills).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {(shift.additionalNotes || shift.additional_notes) && (
              <div>
                <p className="text-muted-foreground text-sm">Additional Notes</p>
                <p className="text-sm">{shift.additionalNotes || shift.additional_notes}</p>
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

// Removed duplicate AvailableShifts function - now imported from separate file
        description: "The shift has been added to your schedule and will appear in 'My Shifts'",
      });
      // Force immediate refresh of ALL shift-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/my-shifts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
      queryClient.refetchQueries({ queryKey: ['/api/shifts/my-shifts'] });
      queryClient.refetchQueries({ queryKey: ['/api/shifts'] });
      console.log('🔄 Cache invalidated - all shift queries refreshed');
    },
    onError: (error: any) => {
      // Handle different types of validation errors with appropriate messaging
      let title = "Unable to Select Shift";
      let description = error.message || "Failed to select shift";
      
      if (error.status === 400) {
        // Past shift error
        title = "Invalid Shift Selection";
        description = error.guidance || error.message;
      } else if (error.status === 409) {
        // Conflict with existing shift
        title = "Shift Conflict Detected";
        description = error.guidance || error.message;
        
        // If we have conflict details, show them in a more detailed format
        if (error.conflictDetails) {
          const conflict = error.conflictDetails;
          description = `You already have a ${conflict.role} shift at ${conflict.careHome} on ${conflict.date} (${conflict.time}). Staff members can only work one shift per day to ensure adequate rest. Please select a shift on a different date.`;
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
        duration: 6000, // Show longer for important validation messages
      });
    },
  });

  // Handle showing confirmation dialog
  const handleShiftSelection = (shift: any) => {
    setSelectedShiftForConfirmation(shift);
    setShowConfirmDialog(true);
  };

  // Handle confirmed shift acceptance
  const handleConfirmShiftSelection = () => {
    if (selectedShiftForConfirmation) {
      selfSelectMutation.mutate(selectedShiftForConfirmation.id);
    }
  };

  // Handle dialog close
  const handleCloseConfirmDialog = () => {
    setShowConfirmDialog(false);
    setSelectedShiftForConfirmation(null);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const calculateShiftHours = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours < 0) hours += 24; // Handle overnight shifts
    return hours;
  };

  const AvailableShiftCard = ({ shift }: { shift: any }) => {
    const shiftHours = getShiftTimes(shift.shiftType || shift.shift_type).duration;
    const wouldExceedLimit = (availableData?.currentWeeklyHours || 0) + shiftHours > (availableData?.weeklyLimit || 40);

    return (
      <Card className="border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {shift.role}
                </CardTitle>
                {shift.shiftRef && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {shift.shiftRef}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  £{shift.hourlyRate}/hr
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">{formatDate(new Date(shift.date))}</span>
            <span className="ml-2">{getShiftTimes(shift.shiftType || shift.shift_type).start} - {getShiftTimes(shift.shiftType || shift.shift_type).end}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-red-500" />
            Care Home Location
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-green-500" />
            {shiftHours} hours
          </div>

          {shift.requiredSkills && shift.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {shift.requiredSkills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {shift.additionalNotes && (
            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {shift.additionalNotes}
            </p>
          )}

          <div className="mt-3 space-y-2">
            {wouldExceedLimit && (
              <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                This shift ({shiftHours}h) would exceed your 40-hour weekly limit. 
                Current: {availableData?.currentWeeklyHours || 0}h
              </div>
            )}
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={selfSelectMutation.isPending || wouldExceedLimit}
              onClick={() => handleShiftSelection(shift)}
            >
              {selfSelectMutation.isPending ? "Processing..." : "Select This Shift"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available shifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-700">
              <h3 className="font-medium mb-2">Unable to load available shifts</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shifts = availableData?.shifts || [];
  const currentWeeklyHours = availableData?.currentWeeklyHours || 0;
  const remainingHours = availableData?.remainingHours || 40;

  return (
    <div className="space-y-6">
      {/* Weekly Hours Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Weekly Hours</h3>
              <p className="text-sm text-blue-700">
                {currentWeeklyHours} of 40 hours used this week
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{remainingHours}h</div>
              <div className="text-sm text-blue-700">remaining</div>
            </div>
          </div>
          <div className="mt-3 bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentWeeklyHours / 40) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Shifts */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Shifts</h2>
        {shifts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No available shifts</h3>
              <p className="text-gray-600">
                {remainingHours <= 0 
                  ? "You've reached your 40-hour weekly limit."
                  : "Check back later for new opportunities."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift: any) => (
              <AvailableShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>

      {/* Shift Confirmation Dialog */}
      <ShiftConfirmationDialog
        shift={selectedShiftForConfirmation}
        isOpen={showConfirmDialog}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmShiftSelection}
      />
    </div>
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
            <p className="mt-2 text-gray-600">Loading training videos...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video: any) => (
              <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleVideoClick(video)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Play className="h-5 w-5 mr-2 text-blue-600" />
                      {video.title}
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {video.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{video.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="capitalize">{video.category}</span>
                      <span className="mx-2">•</span>
                      <span>Updated {new Date(video.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              {selectedVideo?.category} • Uploaded {selectedVideo?.uploadedAt ? new Date(selectedVideo.uploadedAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  src={`/api/videos/${selectedVideo.id}/stream`}
                  poster="/api/admin/videos/placeholder-thumbnail.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {selectedVideo.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedVideo.description}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Duration: {selectedVideo.duration || 'Unknown'}</span>
                <span>Category: {selectedVideo.category}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Timesheets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; timesheet: any }>({
    isOpen: false,
    timesheet: null,
  });

  // Fetch timesheets with proper JWT authentication
  const { data: timesheets, isLoading, error } = useQuery({
    queryKey: ['/api/timesheets'],
    enabled: true
  });

  const submitTimesheetMutation = useMutation({
    mutationFn: async (timesheetData: any) => {
      const response = await apiRequest('/api/timesheets', 'POST', timesheetData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Timesheet Submitted",
        description: "Your timesheet has been submitted for approval",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/timesheets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit timesheet",
        variant: "destructive",
      });
    },
  });

  const updateTimesheetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest(`/api/timesheets/${id}`, 'PUT', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Timesheet Updated",
        description: "Your timesheet has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/timesheets'] });
      setEditDialog({ isOpen: false, timesheet: null });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update timesheet",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-700">
              <h3 className="font-medium mb-2">Unable to load timesheets</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'pending_manager_approval').length : 0})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'approved').length : 0})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'draft').length : 0})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'rejected').length : 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Current Timesheet</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Week ending {new Date().toLocaleDateString()}
            </Badge>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Submit Hours</CardTitle>
              <CardDescription>
                Record your daily work hours for the current period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Timesheet submission form coming soon</p>
                <p className="text-sm mt-2">Contact your manager for manual timesheet submission</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pending Approval</h2>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'pending_manager_approval').length : 0} pending
            </Badge>
          </div>
          
          {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'pending_manager_approval').map((timesheet: any) => (
            <Card key={timesheet.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Week ending {new Date(timesheet.week_end).toLocaleDateString()}</h3>
                    <p className="text-sm text-gray-600">
                      Total Hours: {timesheet.total_hours} | Submitted: {timesheet.submitted_at ? new Date(timesheet.submitted_at).toLocaleDateString() : 'Not submitted'}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Week: {new Date(timesheet.week_start).toLocaleDateString()} - {new Date(timesheet.week_end).toLocaleDateString()}
                    </div>
                    {timesheet.daily_hours && (
                      <div className="mt-2 text-xs text-gray-600">
                        Daily Hours: {Object.entries(timesheet.daily_hours).filter(([day, hours]) => Number(hours) > 0).map(([day, hours]: [string, any]) => 
                          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}h`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )) : null}
          
          {Array.isArray(timesheets) && timesheets.filter((t: any) => t.status === 'pending_manager_approval').length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No timesheets pending approval</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Approved Timesheets</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'approved').length : 0} approved
            </Badge>
          </div>
          
          {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'approved').map((timesheet: any) => (
            <Card key={timesheet.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Week ending {new Date(timesheet.week_end).toLocaleDateString()}</h3>
                    <p className="text-sm text-gray-600">
                      Total Hours: {timesheet.total_hours} | Approved: {timesheet.approved_at ? new Date(timesheet.approved_at).toLocaleDateString() : 'Not approved'}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Week: {new Date(timesheet.week_start).toLocaleDateString()} - {new Date(timesheet.week_end).toLocaleDateString()}
                    </div>
                    {timesheet.daily_hours && (
                      <div className="mt-2 text-xs text-gray-600">
                        Daily Hours: {Object.entries(timesheet.daily_hours).map(([day, hours]) => 
                          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}h`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Approved
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )) : null}
          
          {Array.isArray(timesheets) && timesheets.filter((t: any) => t.status === 'approved').length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No approved timesheets yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Draft Timesheets</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'draft').length : 0} drafts
            </Badge>
          </div>
          
          {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'draft').map((timesheet: any) => (
            <Card key={timesheet.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">Week ending {new Date(timesheet.week_end).toLocaleDateString()}</h3>
                    <p className="text-sm text-gray-600">
                      Total Hours: {timesheet.total_hours} | Status: Not submitted
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Week: {new Date(timesheet.week_start).toLocaleDateString()} - {new Date(timesheet.week_end).toLocaleDateString()}
                    </div>
                    {timesheet.daily_hours && (
                      <div className="mt-2 text-xs text-gray-600">
                        Daily Hours: {Object.entries(timesheet.daily_hours).map(([day, hours]) => 
                          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}h`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialog({ isOpen: true, timesheet })}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Draft
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : null}
          
          {Array.isArray(timesheets) && timesheets.filter((t: any) => t.status === 'draft').length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No draft timesheets</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Rejected Timesheets</h2>
            <Badge variant="outline" className="bg-red-50 text-red-700">
              {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'rejected').length : 0} rejected
            </Badge>
          </div>
          
          {Array.isArray(timesheets) ? timesheets.filter((t: any) => t.status === 'rejected').map((timesheet: any) => (
            <Card key={timesheet.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">Week ending {new Date(timesheet.week_end).toLocaleDateString()}</h3>
                    <p className="text-sm text-gray-600">
                      Total Hours: {timesheet.total_hours} | Rejected: {timesheet.rejected_at ? new Date(timesheet.rejected_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      Week: {new Date(timesheet.week_start).toLocaleDateString()} - {new Date(timesheet.week_end).toLocaleDateString()}
                    </div>
                    {timesheet.rejection_reason && (
                      <div className="mt-2 text-xs text-red-600">
                        Reason: {timesheet.rejection_reason}
                      </div>
                    )}
                    {timesheet.daily_hours && (
                      <div className="mt-2 text-xs text-gray-600">
                        Daily Hours: {Object.entries(timesheet.daily_hours).map(([day, hours]) => 
                          `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}h`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialog({ isOpen: true, timesheet })}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit & Resubmit
                    </Button>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      Rejected
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : null}
          
          {Array.isArray(timesheets) && timesheets.filter((t: any) => t.status === 'rejected').length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rejected timesheets</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Timesheet Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => setEditDialog({ isOpen: open, timesheet: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Timesheet</DialogTitle>
            <DialogDescription>
              Edit your timesheet hours for the week ending {editDialog.timesheet ? new Date(editDialog.timesheet.week_end).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          {editDialog.timesheet && (
            <EditTimesheetForm 
              timesheet={editDialog.timesheet}
              onSubmit={(data) => updateTimesheetMutation.mutate({ id: editDialog.timesheet.id, data })}
              isPending={updateTimesheetMutation.isPending}
              onCancel={() => setEditDialog({ isOpen: false, timesheet: null })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditTimesheetForm({ timesheet, onSubmit, isPending, onCancel }: {
  timesheet: any;
  onSubmit: (data: any) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [dailyHours, setDailyHours] = useState(() => {
    // Initialize with existing daily hours or default values
    const existingHours = timesheet.daily_hours || {};
    return {
      monday: existingHours.monday || 0,
      tuesday: existingHours.tuesday || 0,
      wednesday: existingHours.wednesday || 0,
      thursday: existingHours.thursday || 0,
      friday: existingHours.friday || 0,
      saturday: existingHours.saturday || 0,
      sunday: existingHours.sunday || 0,
    };
  });

  const totalHours = Object.values(dailyHours).reduce((sum, hours) => sum + Number(hours || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate new total hours
    const newTotalHours = Object.values(dailyHours).reduce((sum, hours) => sum + Number(hours || 0), 0);
    
    onSubmit({
      daily_hours: dailyHours,
      total_hours: newTotalHours,
      status: 'pending_manager_approval', // Reset to pending when resubmitting
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Week: {new Date(timesheet.week_start).toLocaleDateString()} - {new Date(timesheet.week_end).toLocaleDateString()}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(dailyHours).map(([day, hours]) => (
          <div key={day}>
            <Label htmlFor={day} className="text-sm font-medium capitalize">
              {day}
            </Label>
            <HoursInput
              value={hours}
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
        
        {/* Mobile navigation is handled by StaffHeader - removed duplicate */}

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
