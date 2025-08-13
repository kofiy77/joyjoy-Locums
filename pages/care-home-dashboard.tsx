import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, MapPin, Star, MessageSquare, Plus, CheckCircle, XCircle, Home, Video, Play, Eye, Menu, X, FileText, LogOut, ChevronLeft, ChevronRight, CalendarDays, HeartHandshake } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

import joyJoyLogo from "@/assets/joyjoy-logo.png";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

const shiftRequestSchema = z.object({
  role: z.string().min(1, "Role is required"),
  date: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(), // For overnight shifts
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  // numberOfStaff and requiredSkills removed for GP practices
  additionalNotes: z.string().optional()
}).refine((data) => {
  // For same-day shifts, validate that end time is after start time
  if (!data.endDate || data.endDate === data.date) {
    const start = new Date(`1970-01-01T${data.startTime}`);
    const end = new Date(`1970-01-01T${data.endTime}`);
    return end > start;
  }
  return true;
}, {
  message: "End time must be after start time for same-day shifts",
  path: ["endTime"]
}).refine((data) => {
  // Calculate duration considering overnight shifts
  const startDate = new Date(`${data.date}T${data.startTime}`);
  const endDate = new Date(`${data.endDate || data.date}T${data.endTime}`);
  const diffInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  return diffInHours > 0 && diffInHours <= 16; // Allow up to 16 hours for overnight shifts
}, {
  message: "Shift duration must be between 1-16 hours",
  path: ["endTime"]
}).refine((data) => {
  // Validate start date is not in the past
  const shiftDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return shiftDate >= today;
}, {
  message: "Start date cannot be in the past",
  path: ["date"]
}).refine((data) => {
  // If end date is provided, validate it's not before start date
  if (data.endDate) {
    const startDate = new Date(data.date);
    const endDate = new Date(data.endDate);
    const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays >= 0 && diffInDays <= 1; // Allow max 1 day difference
  }
  return true;
}, {
  message: "End date must be same day or next day",
  path: ["endDate"]
});

type ShiftRequestData = z.infer<typeof shiftRequestSchema>;

// Available skills for medical staff (adapted for GP practices)
const AVAILABLE_SKILLS = [
  'First Aid',
  'Medication Management', 
  'Dementia Care',
  'Mental Health Support',
  'Mobility Assistance',
  'Personal Care',
  'Wound Care',
  'Palliative Care',
  'Nutrition Support',
  'Infection Control',
  'Emergency Response',
  'Communication Skills',
  'Behavioral Management',
  'Equipment Operation',
  'Documentation',
  // GP Practice specific skills
  'General Practice',
  'Primary Care',
  'Minor Surgery',
  'Contraception Services',
  'Travel Medicine',
  'Chronic Disease Management',
  'Health Screening',
  'Immunizations',
  'Women\'s Health',
  'Children\'s Health'
];

export default function CareHomeDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Debug logging
  console.log('🚀 CareHomeDashboard rendering:', { user, isAuthenticated });

  // Initialize component immediately and when auth state is ready
  useEffect(() => {
    // Always initialize immediately - don't wait for auth state
    setIsInitialized(true);
    
    if (user || isAuthenticated) {
      console.log('✅ Auth state confirmed, care home dashboard ready');
      // Trigger immediate data refresh when authentication is confirmed
      setTimeout(() => {
        console.log('🔄 Triggering immediate refresh after auth confirmation');
        queryClient.invalidateQueries();
      }, 500);
    }
  }, [user, isAuthenticated]);

  // Force initialization immediately on mount to prevent any blocking
  useEffect(() => {
    console.log('🚀 Force initializing care home dashboard immediately on mount');
    setIsInitialized(true);
  }, []);

  // Auto-refresh mechanism for initial load - force data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔄 Auto-refreshing dashboard data on initial load');
      // Force invalidate all queries to ensure fresh data
      queryClient.invalidateQueries();
      // Force refresh Tabs component by toggling active tab
      const currentTab = activeTab;
      setActiveTab(''); 
      setTimeout(() => setActiveTab(currentTab), 100);
    }, 1000); // Wait 1 second after mount
    
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [shiftDetailsModal, setShiftDetailsModal] = useState<any>(null);
  // Removed video-related state as replaced with calendar
  const [activeTab, setActiveTab] = useState(() => {
    if (location === '/calendar') return 'calendar';
    return 'dashboard';
  });
  
  // Multiple shifts state
  const [pendingShifts, setPendingShifts] = useState<ShiftRequestData[]>([]);
  
  // Rate calculation state
  const [ratePreview, setRatePreview] = useState<any>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'calendar') {
      navigate('/calendar');
    } else {
      navigate('/dashboard');
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'timesheets': return 'Locum Timesheets';
      case 'calendar': return 'Locum Calendar';
      default: return 'GP Practice Dashboard';
    }
  };

  // Manager Calendar Helper Functions
  const getCalendarDays = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const getShiftsForDate = (date: Date) => {
    return (shifts || []).filter((shift: any) => {
      if (!shift.date) return false;
      return isSameDay(new Date(shift.date), date);
    });
  };

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-gray-100 text-gray-700';
      case 'assigned': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const form = useForm<ShiftRequestData>({
    resolver: zodResolver(shiftRequestSchema),
    defaultValues: {
      role: "",
      date: "",
      endDate: "",
      startTime: "",
      endTime: "",
      additionalNotes: ""
    }
  });

  // Watch form fields for automatic rate calculation
  const watchedRole = form.watch("role");
  const watchedDate = form.watch("date");
  const watchedEndDate = form.watch("endDate");
  const watchedStartTime = form.watch("startTime");
  const watchedEndTime = form.watch("endTime");

  // Trigger rate calculation when key fields change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedRole && watchedDate && watchedStartTime && watchedEndTime) {
        calculateRatePreview(watchedRole, watchedDate, watchedEndDate, watchedStartTime, watchedEndTime);
      }
    }, 500); // Debounce by 500ms to avoid excessive API calls

    return () => clearTimeout(timeoutId);
  }, [watchedRole, watchedDate, watchedEndDate, watchedStartTime, watchedEndTime]);

  // Helper functions for multiple shifts
  const addShiftToPending = (data: ShiftRequestData) => {
    setPendingShifts(prev => [...prev, { ...data, numberOfStaff: 1 }]);
    form.reset();
    toast({
      title: "Shift Added",
      description: "Shift added to batch. Add more or submit all shifts."
    });
  };

  const removeShiftFromPending = (index: number) => {
    setPendingShifts(prev => prev.filter((_, i) => i !== index));
  };

  const submitAllShifts = async () => {
    if (pendingShifts.length === 0) return;
    
    try {
      // Submit each shift individually
      for (const shift of pendingShifts) {
        await createShiftMutation.mutateAsync(shift);
      }
      
      toast({
        title: "Success",
        description: `${pendingShifts.length} shifts created successfully`
      });
      
      setPendingShifts([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create some shifts. Please try again.",
        variant: "destructive"
      });
    }
  };

  const validateShiftDuration = (startTime: string, endTime: string, startDate?: string, endDate?: string) => {
    if (!startTime || !endTime) return { isValid: true, message: "" };
    
    // Use provided dates or default to same day
    const baseStartDate = startDate || '1970-01-01';
    const baseEndDate = endDate || startDate || '1970-01-01';
    
    const start = new Date(`${baseStartDate}T${startTime}`);
    let end = new Date(`${baseEndDate}T${endTime}`);
    
    // If no end date provided and end time is before start time, assume next day
    if (!endDate && endTime < startTime) {
      const nextDay = new Date(start);
      nextDay.setDate(nextDay.getDate() + 1);
      end = new Date(`${nextDay.toISOString().split('T')[0]}T${endTime}`);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    
    if (diffMs <= 0) {
      return { isValid: false, message: "End time must be after start time" };
    }
    
    if (hours > 16) {
      return { isValid: false, message: "Shift duration cannot exceed 16 hours" };
    }
    
    const totalHours = Math.floor(hours);
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const isOvernight = end.getDate() !== start.getDate();
    
    return { 
      isValid: true, 
      message: `${totalHours}h ${minutes}m${isOvernight ? ' (overnight)' : ''}` 
    };
  };

  // Rate calculation function
  const calculateRatePreview = async (role: string, date: string, endDate: string | undefined, startTime: string, endTime: string) => {
    if (!role || !date || !startTime || !endTime) {
      setRatePreview(null);
      return;
    }

    setRateLoading(true);
    try {
      const response = await fetch('/api/rates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({ role, date, endDate, startTime, endTime })
      });

      if (response.ok) {
        const result = await response.json();
        setRatePreview(result);
      } else {
        console.error('Rate calculation failed:', response.statusText);
        setRatePreview(null);
      }
    } catch (error) {
      console.error('Rate calculation error:', error);
      setRatePreview(null);
    } finally {
      setRateLoading(false);
    }
  };

  // Fetch care home details for current manager
  const { data: careHomeData, isLoading: careHomeLoading } = useQuery({
    queryKey: ['/api/care-homes/me'],
    enabled: !!user && user.type === 'care_home',
    select: (data: any) => data || null
  });

  // Fetch shifts for care home
  const { data: shifts, isLoading: shiftsLoading } = useQuery({
    queryKey: ['/api/care-home/shifts'],
    enabled: !!user && user.type === 'care_home',
    refetchOnMount: true,
    staleTime: 0, // Force fresh data
    select: (data) => Array.isArray(data) ? data : []
  });

  // Manager Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month');

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftRequestData) => {
      console.log('🚀 Mutation starting for:', data);
      const response = await apiRequest('/api/shifts', 'POST', {
        ...data,
        numberOfStaff: 1, // Default to 1 for GP practices
        requiredSkills: [] // Empty skills array for GP practices
      });
      const result = await response.json();
      console.log('✅ Mutation response:', result);
      return result;
    },
    onSuccess: (data: any) => {
      // Handle single shift vs multiple shifts response
      if (data.shifts && data.totalShifts) {
        toast({
          title: "Success",
          description: `${data.totalShifts} shift requests created successfully`
        });
      } else {
        toast({
          title: "Success", 
          description: "Shift request created successfully"
        });
      }
      form.reset();
      // Force immediate refresh of shifts data
      queryClient.invalidateQueries({ queryKey: ['/api/care-home/shifts'] });
      queryClient.refetchQueries({ queryKey: ['/api/care-home/shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shift request",
        variant: "destructive"
      });
    }
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ shiftId, feedback, rating }: { shiftId: string, feedback: string, rating: number }) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/shifts/${shiftId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ feedback, rating }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback submitted successfully"
      });
      setFeedback("");
      setRating(0);
      setSelectedShift(null);
      queryClient.invalidateQueries({ queryKey: ['/api/care-home/shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive"
      });
    }
  });

  // Delete feedback mutation
  const deleteFeedbackMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/shifts/${shiftId}/feedback`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete feedback');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback deleted successfully"
      });
      setShiftDetailsModal(null);
      queryClient.invalidateQueries({ queryKey: ['/api/care-home/shifts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete feedback",
        variant: "destructive"
      });
    }
  });

  const cancelShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const response = await apiRequest(`/api/shifts/${shiftId}/cancel`, 'POST', { 
        reason: 'Care home cancellation',
        details: 'Cancelled by care home manager'
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Shift cancelled",
        description: "The shift has been successfully cancelled and returned to available pool.",
      });
      setShiftDetailsModal(null);
      // Force immediate refetch of shifts data
      queryClient.invalidateQueries({ queryKey: ['/api/care-home/shifts'] });
      queryClient.refetchQueries({ queryKey: ['/api/care-home/shifts'] });
      // Also invalidate available shifts query if it exists
      queryClient.invalidateQueries({ queryKey: ['/api/available-shifts'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel shift. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ShiftRequestData) => {
    if (!validateShiftDuration(data.startTime, data.endTime).isValid) {
      toast({
        title: "Invalid Duration",
        description: "Please check the shift duration requirements",
        variant: "destructive"
      });
      return;
    }
    
    console.log('📝 Submitting shift request:', data);
    // Submit single shift immediately
    createShiftMutation.mutate(data);
  };

  // Check if a shift can be cancelled (24 hours before start time)
  const canCancelShift = (shift: any) => {
    if (!shift || shift.status === 'completed' || shift.status === 'cancelled') {
      return false;
    }

    // Handle shifts without dates - allow cancellation for newly created shifts
    if (!shift.date || !shift.startTime) {
      return ['open', 'assigned', 'accepted'].includes(shift.status);
    }

    const shiftDateTime = new Date(`${shift.date.split('T')[0]}T${shift.startTime}`);
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return shiftDateTime > twentyFourHoursFromNow;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

  const activeShifts = (shifts || []).filter((shift: any) => {
    // Handle shifts with null/undefined dates - use creation date as fallback
    if (!shift.date) {
      // For shifts without proper dates, check creation date
      if (shift.createdAt) {
        const creationDate = new Date(shift.createdAt);
        creationDate.setHours(0, 0, 0, 0);
        // Only include if created today or later and has active status
        return creationDate >= today && ['open', 'assigned', 'accepted', 'requested'].includes(shift.status);
      }
      // If no date at all, only include if it has active status (assume recent)
      return ['open', 'assigned', 'accepted', 'requested'].includes(shift.status);
    }
    
    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Only show shifts from today or future dates that are still active
    return shiftDate >= today && ['open', 'assigned', 'accepted', 'requested'].includes(shift.status);
  });

  const completedShifts = (shifts || []).filter((shift: any) => {
    // Handle shifts with null/undefined dates - use creation date as fallback
    if (!shift.date) {
      // For shifts without proper dates, check creation date
      if (shift.createdAt) {
        const creationDate = new Date(shift.createdAt);
        creationDate.setHours(0, 0, 0, 0);
        // Include if created before today OR has completed status
        return creationDate < today || shift.status === 'completed';
      }
      // If no date at all, only include if completed
      return shift.status === 'completed';
    }
    
    const shiftDate = new Date(shift.date);
    shiftDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    // Show past shifts OR shifts with completed status (cancelled shifts return to open pool)
    return shiftDate < today || shift.status === 'completed';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-gray-100 text-gray-800';
      case 'requested': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false }: { rating: number, onRatingChange?: (rating: number) => void, readonly?: boolean }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {!readonly && <span className="text-sm text-gray-500 ml-2">({rating}/5)</span>}
      </div>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Care Home Timesheets Component
  function CareHomeTimesheets() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: timesheets = [], isLoading, error } = useQuery({
      queryKey: ['/api/care-home/timesheets'],
      enabled: !!user && user.type === 'care_home',
      select: (data: any) => Array.isArray(data) ? data : []
    });

    const approveTimesheetMutation = useMutation({
      mutationFn: async ({ timesheetId, action, notes }: { timesheetId: string; action: 'approve' | 'reject'; notes?: string }) => {
        return apiRequest(`/api/care-home/timesheets/${timesheetId}/approve`, {
          method: 'PUT',
          body: { action, notes } // Remove JSON.stringify - apiRequest handles this
        });
      },
      onSuccess: (data, variables) => {
        toast({
          title: "Timesheet Updated",
          description: `Timesheet has been ${variables.action}d successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/care-home/timesheets'] });
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

    const timesheetArray = Array.isArray(timesheets) ? timesheets : [];
    const pendingTimesheets = timesheetArray.filter((t: any) => t.status === 'pending_manager_approval');
    const approvedTimesheets = timesheetArray.filter((t: any) => t.status === 'approved');
    const rejectedTimesheets = timesheetArray.filter((t: any) => t.status === 'rejected');

    return (
      <div className="space-y-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending Approval ({pendingTimesheets.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedTimesheets.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedTimesheets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Pending Approval</h2>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {pendingTimesheets.length} awaiting review
              </Badge>
            </div>
            
            {pendingTimesheets.map((timesheet: any) => (
              <Card key={timesheet.id} className="border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{timesheet.staff_name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Week ending {new Date(timesheet.week_end).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Hours</p>
                          <p className="text-2xl font-bold text-blue-600">{timesheet.total_hours}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Submitted</p>
                          <p className="text-sm text-gray-600">{new Date(timesheet.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {timesheet.daily_hours && Object.keys(timesheet.daily_hours).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Daily Breakdown</p>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(timesheet.daily_hours)
                              .filter(([day, hours]) => Number(hours) > 0)
                              .map(([day, hours]: [string, any], index: number) => {
                                // Calculate the actual date for this day of the week
                                const weekStart = new Date(timesheet.week_start);
                                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                const dayIndex = dayNames.indexOf(day.toLowerCase());
                                const actualDate = new Date(weekStart);
                                actualDate.setDate(weekStart.getDate() + dayIndex);
                                
                                return (
                                  <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <div className="flex flex-col">
                                      <span className="capitalize font-medium">{day}</span>
                                      <span className="text-xs text-gray-600">{actualDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                    <span className="font-medium">{hours}h</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => approveTimesheetMutation.mutate({ 
                          timesheetId: timesheet.id, 
                          action: 'approve' 
                        })}
                        disabled={approveTimesheetMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approveTimesheetMutation.isPending ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => approveTimesheetMutation.mutate({ 
                          timesheetId: timesheet.id, 
                          action: 'reject',
                          notes: 'Requires review'
                        })}
                        disabled={approveTimesheetMutation.isPending}
                        size="sm"
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pendingTimesheets.length === 0 && (
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
                {approvedTimesheets.length} approved
              </Badge>
            </div>
            
            {approvedTimesheets.map((timesheet: any) => (
              <Card key={timesheet.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{timesheet.staff_name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Week ending {new Date(timesheet.week_end).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Hours</p>
                          <p className="text-lg font-bold text-green-600">{timesheet.total_hours}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Approved</p>
                          <p className="text-sm text-gray-600">{new Date(timesheet.approved_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {timesheet.daily_hours && Object.keys(timesheet.daily_hours).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Daily Breakdown</p>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(timesheet.daily_hours)
                              .filter(([day, hours]) => Number(hours) > 0)
                              .map(([day, hours]: [string, any], index: number) => {
                                // Calculate the actual date for this day of the week
                                const weekStart = new Date(timesheet.week_start);
                                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                const dayIndex = dayNames.indexOf(day.toLowerCase());
                                const actualDate = new Date(weekStart);
                                actualDate.setDate(weekStart.getDate() + dayIndex);
                                
                                return (
                                  <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <div className="flex flex-col">
                                      <span className="capitalize font-medium">{day}</span>
                                      <span className="text-xs text-gray-600">{actualDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                    <span className="font-medium">{hours}h</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 ml-4">
                      Approved
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {approvedTimesheets.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No approved timesheets yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Rejected Timesheets</h2>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {rejectedTimesheets.length} rejected
              </Badge>
            </div>
            
            {rejectedTimesheets.map((timesheet: any) => (
              <Card key={timesheet.id} className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{timesheet.staff_name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Week ending {new Date(timesheet.week_end).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Hours</p>
                          <p className="text-lg font-bold text-red-600">{timesheet.total_hours}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rejected</p>
                          <p className="text-sm text-gray-600">{timesheet.approved_at ? new Date(timesheet.approved_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      
                      {timesheet.approved_notes && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700 mt-1">{timesheet.approved_notes}</p>
                        </div>
                      )}
                      
                      {timesheet.daily_hours && Object.keys(timesheet.daily_hours).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Daily Breakdown</p>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(timesheet.daily_hours)
                              .filter(([day, hours]) => Number(hours) > 0)
                              .map(([day, hours]: [string, any], index: number) => {
                                // Calculate the actual date for this day of the week
                                const weekStart = new Date(timesheet.week_start);
                                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                const dayIndex = dayNames.indexOf(day.toLowerCase());
                                const actualDate = new Date(weekStart);
                                actualDate.setDate(weekStart.getDate() + dayIndex);
                                
                                return (
                                  <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                                    <div className="flex flex-col">
                                      <span className="capitalize font-medium">{day}</span>
                                      <span className="text-xs text-gray-600">{actualDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                    <span className="font-medium">{hours}h</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 ml-4">
                      Rejected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {rejectedTimesheets.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No rejected timesheets</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      
      {/* Desktop Top Navigation Header */}
      <nav className="bg-blue-800 border-b border-blue-900 px-6 py-4 hidden md:block" style={{marginTop: '30px'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <HeartHandshake className="h-12 w-12 text-white" />
            <div>
              <h1 className="text-xl font-semibold text-white">JoyJoy Locums</h1>
              <p className="text-sm text-blue-200">GP Practice Portal - Manage your locum needs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge className="bg-blue-600 text-white text-xs">
                Practice Manager
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="text-blue-200 hover:text-white hover:bg-blue-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-blue-600 text-white hover:bg-blue-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation */}
        <div className="md:hidden mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Menu className="h-4 w-4" />
                  {getTitle()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => handleTabChange('dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTabChange('timesheets')}>
                <FileText className="h-4 w-4 mr-2" />
                Timesheets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTabChange('calendar')}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => window.open('/', '_blank')}>
                <Home className="h-4 w-4 mr-2" />
                Visit Website
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
              <p className="text-gray-600 mt-2">
                {activeTab === 'calendar' 
                  ? 'View all assigned and confirmed staff bookings'
                  : activeTab === 'timesheets'
                  ? 'Review and approve staff timesheet submissions'
                  : 'Manage your staffing needs efficiently'
                }
              </p>
            </div>
          </div>
        </div>



        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="w-full overflow-x-auto scrollbar-hide flex md:grid md:grid-cols-3 gap-1 mobile-tabs md:gap-2 p-1 hidden md:flex h-14 md:h-10">
            <TabsTrigger value="dashboard" className="staff-main-tab flex-shrink-0 min-w-0 h-12 md:h-8">
              <div className="flex flex-col items-center justify-center">
                <Home className="h-4 w-4 mb-1 md:hidden" />
                <span className="text-xs md:text-sm truncate">Dashboard</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="timesheets" className="staff-main-tab flex-shrink-0 min-w-0 h-12 md:h-8">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-4 w-4 mb-1 md:hidden" />
                <span className="text-xs md:text-sm truncate">Timesheets</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="staff-main-tab flex-shrink-0 min-w-0 h-12 md:h-8">
              <div className="flex flex-col items-center justify-center">
                <CalendarDays className="h-4 w-4 mb-1 md:hidden" />
                <span className="text-xs md:text-sm truncate">Calendar</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timesheets" className="space-y-6">
            <CareHomeTimesheets />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">

          {/* Manager Calendar Interface */}
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(calendarDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCalendarDate(new Date())}
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Calendar Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Shifts</p>
                      <p className="text-2xl font-bold">{(shifts || []).length}</p>
                    </div>
                    <CalendarDays className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Assigned</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {(shifts || []).filter(s => s.status === 'assigned').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(shifts || []).filter(s => s.status === 'accepted').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Open Slots</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {(shifts || []).filter(s => s.status === 'open' || s.status === 'requested').length}
                      </p>
                    </div>
                    <Plus className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-px bg-gray-200 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-white p-3 text-center font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                  {getCalendarDays().map((day, index) => {
                    const dayShifts = getShiftsForDate(day);
                    const isCurrentMonth = isSameMonth(day, calendarDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div
                        key={index}
                        className={`bg-white p-2 min-h-24 ${isCurrentMonth ? '' : 'opacity-50'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayShifts.slice(0, 3).map((shift: any) => (
                            <div
                              key={shift.id}
                              className={`text-xs p-1 rounded cursor-pointer truncate ${getShiftStatusColor(shift.status)}`}
                              onClick={() => setSelectedShift(shift)}
                              title={`${shift.role} - ${shift.staffName || 'Unassigned'}`}
                            >
                              {shift.role}
                            </div>
                          ))}
                          {dayShifts.length > 3 && (
                            <div className="text-xs text-gray-500 p-1">
                              +{dayShifts.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Shift Detail Modal */}
            {selectedShift && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Shift Details
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedShift(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Role</Label>
                      <p className="text-gray-600">{selectedShift.role}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Date & Time</Label>
                      <p className="text-gray-600">
                        {selectedShift.date && format(new Date(selectedShift.date), 'PPP')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getShiftStatusColor(selectedShift.status)}>
                        {selectedShift.status}
                      </Badge>
                    </div>
                    {selectedShift.staffName && (
                      <div>
                        <Label className="text-sm font-medium">Assigned Staff</Label>
                        <p className="text-gray-600">{selectedShift.staffName}</p>
                      </div>
                    )}
                    {selectedShift.requiredSkills && selectedShift.requiredSkills.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Required Skills</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedShift.requiredSkills.map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedShift.additionalNotes && (
                      <div>
                        <Label className="text-sm font-medium">Notes</Label>
                        <p className="text-gray-600 text-sm">{selectedShift.additionalNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Content fully rendered and working */}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Care Home Organization Info - Mobile Optimized */}
            {(careHomeData && careHomeData.name) ? (
              <div className="col-span-full mb-6">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Home className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">{careHomeData.name}</h3>
                        
                        {/* Mobile: Stack vertically, Desktop: Horizontal */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                          {careHomeData.address && careHomeData.postcode && (
                            <span className="flex items-center gap-1 min-w-0">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{careHomeData.address}, {careHomeData.postcode}</span>
                            </span>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
                            {careHomeData.facilityType && (
                              <Badge variant="outline" className="text-blue-700 border-blue-200 text-xs">
                                {careHomeData.facilityType}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {careHomeData.careHomeGroup && careHomeData.careHomeGroup.name && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Part of:</span> 
                            <span className="ml-1">{careHomeData.careHomeGroup.name}</span>
                            {careHomeData.careHomeGroup.totalLocations && careHomeData.careHomeGroup.totalLocations > 1 && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                                {careHomeData.careHomeGroup.totalLocations} locations
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="col-span-full mb-6">
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Home className="h-6 w-6 text-gray-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900">Practice Portal</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          Westminster Medical Centre - Locum Management System
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* New Shift Request Form */}
          <div className="lg:col-span-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  New Shift Request
                </CardTitle>
                {careHomeData && (
                  <p className="text-sm text-muted-foreground">
                    Requesting staff for: {careHomeData.name}
                  </p>
                )}
                
                {pendingShifts.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="secondary">
                      {pendingShifts.length} pending shifts
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                      <Label htmlFor="role">Role Required</Label>
                      <Select onValueChange={(value) => form.setValue("role", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Practitioner (GP)">General Practitioner (GP)</SelectItem>
                          <SelectItem value="Advanced Nurse Practitioner (ANP)">Advanced Nurse Practitioner (ANP)</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.role && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.role.message}</p>
                      )}
                    </div>

                    {/* Date Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="date">Start Date</Label>
                        <Input
                          id="date"
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          {...form.register("date")}
                        />
                        {form.formState.errors.date && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.date.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="endDate">
                          End Date <span className="text-xs text-gray-500">(overnight)</span>
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          min={form.watch("date") || new Date().toISOString().split('T')[0]}
                          {...form.register("endDate")}
                          placeholder="Same day if not overnight"
                        />
                        {form.formState.errors.endDate && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.endDate.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Time Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          {...form.register("startTime")}
                        />
                        {form.formState.errors.startTime && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.startTime.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          {...form.register("endTime")}
                        />
                        {form.formState.errors.endTime && (
                          <p className="text-sm text-red-500 mt-1">{form.formState.errors.endTime.message}</p>
                        )}
                      </div>
                    </div>
                  
                  {/* Duration Display */}
                  {form.watch("startTime") && form.watch("endTime") && (
                    <div className={`text-sm p-3 rounded-lg border ${
                      (() => {
                        const validation = validateShiftDuration(
                          form.watch("startTime"), 
                          form.watch("endTime"), 
                          form.watch("date"), 
                          form.watch("endDate")
                        );
                        return validation.isValid 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200';
                      })()
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          validateShiftDuration(
                            form.watch("startTime"), 
                            form.watch("endTime"), 
                            form.watch("date"), 
                            form.watch("endDate")
                          ).isValid
                            ? 'text-green-700' 
                            : 'text-red-700'
                        }`}>
                          Shift Duration:
                        </span>
                        <span className={`font-semibold ${
                          validateShiftDuration(
                            form.watch("startTime"), 
                            form.watch("endTime"), 
                            form.watch("date"), 
                            form.watch("endDate")
                          ).isValid
                            ? 'text-green-700' 
                            : 'text-red-600'
                        }`}>
                          {validateShiftDuration(
                            form.watch("startTime"), 
                            form.watch("endTime"), 
                            form.watch("date"), 
                            form.watch("endDate")
                          ).message}
                        </span>
                      </div>
                      {!validateShiftDuration(
                        form.watch("startTime"), 
                        form.watch("endTime"), 
                        form.watch("date"), 
                        form.watch("endDate")
                      ).isValid && (
                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {validateShiftDuration(
                            form.watch("startTime"), 
                            form.watch("endTime"), 
                            form.watch("date"), 
                            form.watch("endDate")
                          ).message}
                        </p>
                      )}
                      {validateShiftDuration(
                        form.watch("startTime"), 
                        form.watch("endTime"), 
                        form.watch("date"), 
                        form.watch("endDate")
                      ).isValid && 
                       form.watch("startTime") && form.watch("endTime") && (
                        <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Valid shift duration
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rate Calculation Preview */}
                  {form.watch("role") && form.watch("date") && form.watch("startTime") && form.watch("endTime") && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
                        💰 Rate Calculation Preview
                      </h4>
                      
                      {rateLoading ? (
                        <div className="flex items-center gap-2 text-blue-700 text-xs">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700"></div>
                          Calculating rates...
                        </div>
                      ) : ratePreview ? (
                        <div className="space-y-2">
                          {/* Base Rate Display */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-blue-700">Base Rate:</span>
                            <span className="text-xs font-medium text-blue-900">
                              £{ratePreview.baseInternalRate}/hr (Pay) | £{ratePreview.baseExternalRate}/hr (Charge)
                            </span>
                          </div>
                          
                          {/* Applied Multipliers */}
                          {ratePreview.appliedMultipliers && ratePreview.appliedMultipliers.length > 0 && (
                            <div>
                              <span className="text-xs text-blue-700">Applied Multipliers:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {ratePreview.appliedMultipliers.map((multiplier: any, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs border-blue-300 text-blue-800 py-0 px-1 h-5">
                                    {multiplier.name} ({multiplier.multiplier}x)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Final Rates */}
                          <div className="border-t border-blue-200 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-blue-700">Final Rate:</span>
                              <span className="text-xs font-bold text-blue-900">
                                £{ratePreview.finalInternalRate}/hr (Pay) | £{ratePreview.finalExternalRate}/hr (Charge)
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs font-medium text-blue-700">Total Cost ({ratePreview.durationHours}h):</span>
                              <span className="text-xs font-bold text-blue-900">
                                £{ratePreview.totalInternalCost} (Pay) | £{ratePreview.totalExternalCost} (Charge)
                              </span>
                            </div>
                          </div>
                          
                          {/* Shift Context Info */}
                          <div className="text-xs text-blue-600 bg-blue-100 p-1.5 rounded">
                            <strong>Shift Context:</strong> {ratePreview.shiftContext?.join(', ') || 'Standard shift'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-blue-700 text-sm">
                          Rate calculation will appear here once all fields are filled
                        </div>
                      )}
                    </div>
                  )}

                  {/* Number of Staff and Required Skills fields removed for GP practices */}

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any specific requirements or notes for this shift..."
                      {...form.register("additionalNotes")}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createShiftMutation.isPending || !validateShiftDuration(form.watch("startTime"), form.watch("endTime")).isValid}
                    >
                      {createShiftMutation.isPending ? "Creating..." : "Create Shift Request"}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!validateShiftDuration(form.watch("startTime"), form.watch("endTime")).isValid) {
                          toast({
                            title: "Invalid Duration",
                            description: "Please check the shift duration requirements",
                            variant: "destructive"
                          });
                          return;
                        }
                        addShiftToPending(form.getValues());
                      }}
                      disabled={!form.watch("role") || !form.watch("date") || !form.watch("startTime") || !form.watch("endTime")}
                    >
                      Add Shift
                    </Button>
                    
                    {pendingShifts.length > 0 && (
                      <Button 
                        type="button"
                        variant="secondary"
                        onClick={submitAllShifts}
                        disabled={createShiftMutation.isPending}
                      >
                        Submit All ({pendingShifts.length})
                      </Button>
                    )}
                  </div>
                  </form>

                {/* Pending Shifts List */}
                {pendingShifts.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Pending Shifts ({pendingShifts.length})</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingShifts([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {pendingShifts.map((shift, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border text-sm">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {shift.role ? shift.role.replace('_', ' ') : 'Healthcare Role'} 
                              </div>
                              <div className="text-gray-600">
                                {new Date(shift.date).toLocaleDateString('en-GB', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short'
                                })} • {shift.startTime} - {shift.endTime}
                              </div>
                              <div className="text-xs text-blue-600">
                                {validateShiftDuration(shift.startTime, shift.endTime).message}
                              </div>
                              {/* Skills display removed for GP practices */}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeShiftFromPending(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shift Lists */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active Requests ({activeShifts.length})</TabsTrigger>
                <TabsTrigger value="history">History ({completedShifts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {shiftsLoading ? (
                  <div className="text-center py-8">Loading shifts...</div>
                ) : activeShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active shift requests. Create your first request to get started.
                  </div>
                ) : (
                  activeShifts.map((shift: any) => (
                    <Card key={shift.id} className={`hover:shadow-md transition-shadow cursor-pointer ${
                      shift.status === 'accepted' ? 'bg-green-50 border-green-200' :
                      shift.status === 'assigned' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-white border-gray-200'
                    }`} onClick={() => setShiftDetailsModal(shift)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">{shift.role ? shift.role.replace('_', ' ') : 'Healthcare Role'}</h3>
                              {shift.shiftRef && (
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {shift.shiftRef}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(shift.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {shift.startTime} - {shift.endTime}
                              </span>
                              <span className="font-medium">£{shift.hourlyRate}/hr</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(shift.status)}>
                            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                          </Badge>
                        </div>

                        {shift.requiredSkills && shift.requiredSkills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Required Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {shift.requiredSkills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {shift.additionalNotes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                            <p className="text-sm text-gray-600">{shift.additionalNotes}</p>
                          </div>
                        )}

                        {/* Show staff assignment info for assigned/accepted shifts */}
                        {(shift.status === 'accepted' || shift.status === 'assigned' || shift.assignmentStatus === 'accepted' || shift.assignmentStatus === 'assigned') && (shift.staffName || shift.assignedStaffName) && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Assigned to: {shift.staffName || shift.assignedStaffName}</span>
                            </div>
                          </div>
                        )}

                        {(shift.status === 'accepted' || shift.status === 'assigned' || shift.status === 'completed') && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {(shift.staffName || shift.assignedStaffName) && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-700">Assigned Staff: </span>
                                <span className="text-sm text-gray-900">{shift.staffName || shift.assignedStaffName}</span>
                              </div>
                            )}
                            {(() => {
                              // Only show feedback button for shifts that have occurred in the past
                              const shiftDate = new Date(shift.date);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              shiftDate.setHours(0, 0, 0, 0);
                              return shiftDate < today;
                            })() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedShift(shift)}
                                className="flex items-center gap-2"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Provide Feedback
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {completedShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No completed shifts yet.
                  </div>
                ) : (
                  completedShifts.map((shift: any) => (
                    <Card key={shift.id} className={`opacity-75 cursor-pointer hover:opacity-90 transition-opacity ${
                      shift.status === 'accepted' || shift.status === 'completed' ? 'bg-green-50 border-green-200' :
                      shift.status === 'assigned' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-white border-gray-200'
                    }`} onClick={() => setShiftDetailsModal(shift)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-lg">{shift.role ? shift.role.replace('_', ' ') : 'Healthcare Role'}</h3>
                              {shift.shiftRef && (
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {shift.shiftRef}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(shift.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {shift.startTime} - {shift.endTime}
                              </span>
                              <span className="font-medium">£{shift.hourlyRate}/hr</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(shift.status)}>
                              {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                            </Badge>
                            {shift.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>

                        {(shift.status === 'completed' || shift.status === 'accepted') && (shift.staffName || shift.assignedStaffName) && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-700">Staff Member: </span>
                            <span className="text-sm text-gray-900">{shift.staffName || shift.assignedStaffName}</span>
                          </div>
                        )}

                        {shift.feedback && (shift.status === 'accepted' || shift.status === 'completed') && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Your Feedback:</h4>
                            <p className="text-sm text-gray-600">{shift.feedback}</p>
                            {shift.rating && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">Rating: </span>
                                <StarRating rating={shift.rating} readonly={true} />
                              </div>
                            )}
                            
                            {/* Admin Response Display */}
                            {shift.adminResponse && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Admin Response:</span>
                                </div>
                                <p className="text-sm text-green-800">{shift.adminResponse}</p>
                                {shift.respondedBy && shift.responseDate && (
                                  <p className="text-xs text-green-600 mt-2">
                                    - {shift.respondedBy} on {new Date(shift.responseDate).toLocaleDateString('en-GB')}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-3 flex items-center gap-4">
                              <button
                                onClick={() => {
                                  setSelectedShift(shift);
                                  setFeedback(shift.feedback);
                                  setRating(shift.rating || 0);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Star className="h-3 w-3" />
                                Update Feedback
                              </button>
                              
                              <button
                                onClick={() => {
                                  const confirmMessage = `Are you sure you want to delete the feedback for this shift?\n\nThis action cannot be undone.`;
                                  
                                  if (window.confirm(confirmMessage)) {
                                    deleteFeedbackMutation.mutate(shift.id);
                                  }
                                }}
                                disabled={deleteFeedbackMutation.isPending}
                                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                                {deleteFeedbackMutation.isPending ? 'Deleting...' : 'Delete Feedback'}
                              </button>
                            </div>
                          </div>
                        )}

                        {!shift.feedback && (shift.status === 'accepted' || shift.status === 'completed') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedShift(shift);
                              setFeedback("");
                              setRating(0);
                            }}
                            className="mt-4 flex items-center gap-2"
                          >
                            <Star className="h-4 w-4" />
                            Rate Experience
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Shift Details Modal */}
        {shiftDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Shift Details</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShiftDetailsModal(null)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">{shiftDetailsModal.role ? shiftDetailsModal.role.replace('_', ' ') : 'Healthcare Role'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date</Label>
                      <p className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(shiftDetailsModal.date)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Time</Label>
                      <p className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4" />
                        {shiftDetailsModal.startTime} - {shiftDetailsModal.endTime}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Hourly Rate</Label>
                      <p className="font-semibold text-lg mt-1">£{shiftDetailsModal.hourlyRate}/hr</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <Badge className={getStatusColor(shiftDetailsModal.status)} style={{marginTop: '4px'}}>
                        {shiftDetailsModal.status.charAt(0).toUpperCase() + shiftDetailsModal.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Required Skills */}
                {shiftDetailsModal.requiredSkills && shiftDetailsModal.requiredSkills.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Required Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {shiftDetailsModal.requiredSkills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {shiftDetailsModal.additionalNotes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Additional Notes</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{shiftDetailsModal.additionalNotes}</p>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(shiftDetailsModal.createdAt).toLocaleDateString()} at {new Date(shiftDetailsModal.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => setShiftDetailsModal(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  
                  {canCancelShift(shiftDetailsModal) && (
                    <Button
                      onClick={() => {
                        const shiftDate = new Date(`${shiftDetailsModal.date.split('T')[0]}T${shiftDetailsModal.startTime}`);
                        const confirmMessage = `Are you sure you want to cancel this shift?\n\nShift: ${shiftDetailsModal.role ? shiftDetailsModal.role.replace('_', ' ') : 'Healthcare Role'}\nDate: ${formatDate(shiftDetailsModal.date)}\nTime: ${shiftDetailsModal.startTime} - ${shiftDetailsModal.endTime}\n\nThis action cannot be undone and will remove the shift permanently.`;
                        
                        if (window.confirm(confirmMessage)) {
                          cancelShiftMutation.mutate(shiftDetailsModal.id);
                        }
                      }}
                      disabled={cancelShiftMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {cancelShiftMutation.isPending ? 'Cancelling...' : 'Cancel Shift'}
                    </Button>
                  )}
                  
                  {!canCancelShift(shiftDetailsModal) && shiftDetailsModal.status !== 'completed' && shiftDetailsModal.status !== 'cancelled' && (
                    <div className="flex-1">
                      <Button
                        disabled
                        variant="outline"
                        className="w-full text-gray-400"
                        title="Cannot cancel shift within 24 hours of start time"
                      >
                        Cancel Shift
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Cannot cancel within 24 hours
                      </p>
                    </div>
                  )}

                  {shiftDetailsModal.status === 'completed' && (
                    <Button
                      onClick={() => {
                        setSelectedShift(shiftDetailsModal);
                        // Pre-populate form with existing feedback if available
                        if (shiftDetailsModal.feedback) {
                          setFeedback(shiftDetailsModal.feedback);
                          setRating(shiftDetailsModal.rating || 0);
                        } else {
                          setFeedback("");
                          setRating(0);
                        }
                        setShiftDetailsModal(null);
                      }}
                      className="flex-1"
                    >
                      {shiftDetailsModal.feedback ? 'Update Feedback' : 'Provide Feedback'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feedback Modal */}
        {selectedShift && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {selectedShift.feedback ? 'Update Feedback' : 'Provide Feedback'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {selectedShift.feedback ? 'Modify your experience with this shift' : 'Share your experience with this shift'}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Rate this shift</Label>
                  <StarRating rating={rating} onRatingChange={setRating} />
                </div>
                <div>
                  <Label htmlFor="feedback">Your Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="How was your experience with this staff member? Any comments for improvement?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setSelectedShift(null);
                      setFeedback("");
                      setRating(0);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => submitFeedbackMutation.mutate({ 
                      shiftId: selectedShift.id, 
                      feedback,
                      rating
                    })}
                    disabled={rating === 0 || !feedback.trim() || submitFeedbackMutation.isPending}
                    className="flex-1"
                  >
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}