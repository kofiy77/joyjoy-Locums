import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay } from 'date-fns';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import StaffHeader from '@/components/StaffHeader';

interface Shift {
  id: string;
  shiftRef: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  shift_type: string;
  status: string;
  hourlyRate: string;
  practiceName: string;
  additionalNotes?: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_type: 'holiday' | 'training' | 'working_elsewhere' | 'unavailable';
  description?: string;
}

const MyDiary = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortBy, setSortBy] = useState('all');
  const [showShiftDetail, setShowShiftDetail] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newEvent, setNewEvent] = useState<{
    title: string;
    event_date: string;
    event_type: 'holiday' | 'training' | 'working_elsewhere' | 'unavailable';
    description: string;
  }>({
    title: '',
    event_date: '',
    event_type: 'holiday',
    description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch shifts data
  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['/api/shifts/my-shifts'],
    queryFn: async () => {
      console.log('🔍 MyDiary fetching shifts...');
      const response = await apiRequest('/api/shifts/my-shifts');
      const data = await response.json();
      console.log('✅ MyDiary shifts data:', data);
      return data;
    },
    select: (data: any) => {
      console.log('🔄 MyDiary processing shifts:', data);
      return Array.isArray(data) ? data : [];
    }
  });

  // Time utilities
  const getTimeRange = (shiftType: string) => {
    switch (shiftType?.toLowerCase()) {
      case 'day':
        return '07:00 - 19:00';
      case 'evening':
        return '19:00 - 07:00';
      case 'night':
        return '19:00 - 07:00';
      default:
        return 'N/A';
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    try {
      return format(new Date(`2000-01-01T${timeString}`), 'HH:mm');
    } catch {
      return 'N/A';
    }
  };

  const formatShiftDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'EEE, dd MMM yyyy');
    } catch {
      return 'N/A';
    }
  };

  // Month navigation
  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // Calculate calendar data
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfMonth(currentDate);
  const calendarEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Calculate stats based on current month
  const currentMonthShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    return shiftDate >= monthStart && shiftDate <= monthEnd;
  });

  const stats = {
    applied: currentMonthShifts.filter(s => s.status === 'applied').length,
    shifts: currentMonthShifts.length,
    daysAvailable: 26, // This would be calculated based on availability data
    monthlyIncome: currentMonthShifts.reduce((sum, shift) => sum + (parseFloat(shift.hourlyRate) * 8 || 0), 0)
  };

  // Get shifts for a specific day
  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => isSameDay(new Date(shift.date), date));
  };

  // Handle add event
  const handleAddEvent = () => {
    // Add event logic here
    setShowAddEvent(false);
    setNewEvent({ title: '', event_date: '', event_type: 'holiday', description: '' });
    toast({ title: 'Event added successfully' });
  };

  // Cancel shift mutation
  const cancelShiftMutation = useMutation({
    mutationFn: async ({ shiftId, reason }: { shiftId: string; reason: string }) => {
      return apiRequest(`/api/shifts/${shiftId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/my-shifts'] });
      setShowCancelDialog(false);
      setCancelReason('');
      toast({ title: 'Shift cancelled successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to cancel shift', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader activeTab="my-diary" />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading your diary...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <StaffHeader activeTab="my-diary" />
        
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Diary</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.applied}</div>
              <div className="text-sm font-medium text-gray-600">Applied</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.shifts}</div>
              <div className="text-sm font-medium text-gray-600">Shifts</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.daysAvailable}</div>
              <div className="text-sm font-medium text-gray-600">Days Available</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">£{stats.monthlyIncome.toFixed(2)}</div>
              <div className="text-sm font-medium text-gray-600">{format(currentDate, 'MMMM')} Income</div>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="shifts">Shifts Only</SelectItem>
                  <SelectItem value="training">Training Only</SelectItem>
                  <SelectItem value="holiday">Holidays</SelectItem>
                  <SelectItem value="working_elsewhere">Working Elsewhere</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={() => setShowAddEvent(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Event
            </Button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="p-2 h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-semibold text-gray-900 min-w-[180px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="p-2 h-10 w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px">
              {/* Previous month filler days */}
              {Array.from({ length: getDay(monthStart) }, (_, i) => {
                const date = new Date(monthStart);
                date.setDate(date.getDate() - (getDay(monthStart) - i));
                return (
                  <div key={`prev-${i}`} className="min-h-[120px] p-2 bg-gray-50 border">
                    <div className="text-sm text-gray-400 mb-2">{format(date, 'd')}</div>
                  </div>
                );
              })}
              
              {/* Current month days */}
              {calendarDays.map((date) => {
                const dayShifts = getShiftsForDay(date);
                const isCurrentDay = isToday(date);
                
                return (
                  <div 
                    key={format(date, 'yyyy-MM-dd')} 
                    className={`min-h-[120px] p-2 border bg-white ${
                      isCurrentDay ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    
                    {/* Shift entries for this day */}
                    <div className="space-y-1">
                      {dayShifts.map((shift, index) => (
                        <div
                          key={`${shift.id}-${format(date, 'yyyy-MM-dd')}-${index}`}
                          onClick={() => {
                            setSelectedShift(shift);
                            setShowShiftDetail(true);
                          }}
                          className="text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          <div className="font-medium truncate">
                            {getTimeRange(shift.shift_type)}
                          </div>
                          <div className="truncate">
                            {shift.practiceName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Next month filler days */}
              {Array.from({ length: (7 - ((getDay(monthStart) + calendarDays.length) % 7)) % 7 }, (_, i) => {
                const date = new Date(monthEnd);
                date.setDate(date.getDate() + i + 1);
                return (
                  <div key={`next-${i}`} className="min-h-[120px] p-2 bg-gray-50 border">
                    <div className="text-sm text-gray-400 mb-2">{format(date, 'd')}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Shift Detail Dialog */}
      <Dialog open={showShiftDetail && !!selectedShift} onOpenChange={setShowShiftDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedShift && (
                <Badge className="mr-2">{selectedShift.shiftRef}</Badge>
              )}
              Shift Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <p className="text-sm text-gray-600">{selectedShift.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Practice</p>
                  <p className="text-sm text-gray-600">{selectedShift.practiceName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Date</p>
                  <p className="text-sm text-gray-600">
                    {formatShiftDate(selectedShift.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Time</p>
                  <p className="text-sm text-gray-600">
                    {getTimeRange(selectedShift.shift_type)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Hourly Rate</p>
                  <p className="text-sm text-gray-600">£{selectedShift.hourlyRate}/hr</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-sm text-gray-600 capitalize">{selectedShift.status}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Notes</p>
                <p className="text-sm text-gray-600">
                  {selectedShift.additionalNotes || 'No additional notes'}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <Badge className={
                    selectedShift.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    selectedShift.status === 'accepted' || selectedShift.status === 'assigned' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {selectedShift.status === 'completed' ? 'Completed' :
                     selectedShift.status === 'accepted' || selectedShift.status === 'assigned' ? 'Booked' :
                     selectedShift.status}
                  </Badge>
                </div>
                
                {/* Cancel button for booked shifts */}
                {(selectedShift.status === 'accepted' || selectedShift.status === 'assigned') && 
                 new Date(selectedShift.date) >= new Date() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelDialog(true)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel Shift
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <p className="text-sm text-gray-600">Mark an event on your calendar</p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Event Type</label>
              <Select 
                value={newEvent.event_type} 
                onValueChange={(value: 'holiday' | 'training' | 'working_elsewhere' | 'unavailable') => 
                  setNewEvent(prev => ({ ...prev, event_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="working_elsewhere">Working Elsewhere</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                placeholder="Type here..."
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                placeholder="Add any additional details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddEvent(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddEvent}
                disabled={!newEvent.event_type || !newEvent.event_date || !newEvent.title}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Add Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Shift</DialogTitle>
            <p className="text-sm text-gray-600">Please provide a reason for cancelling this shift</p>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Shift Details</div>
                <div className="text-sm text-gray-600">
                  <Badge className="mr-2">{selectedShift.shiftRef}</Badge>
                  {selectedShift.role} at {selectedShift.practiceName}<br />
                  {formatShiftDate(selectedShift.date)} • {getTimeRange(selectedShift.shift_type)}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Reason for cancellation</label>
                <Select value={cancelReason} onValueChange={setCancelReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sickness">Sickness</SelectItem>
                    <SelectItem value="family_emergency">Family Emergency</SelectItem>
                    <SelectItem value="transport_issues">Transport Issues</SelectItem>
                    <SelectItem value="personal_emergency">Personal Emergency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Please note:</strong> Cancelling this shift will make it available for other staff members to book immediately.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                  }}
                  className="flex-1"
                >
                  Keep Shift
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedShift && cancelReason) {
                      cancelShiftMutation.mutate({
                        shiftId: selectedShift.id,
                        reason: cancelReason
                      });
                    }
                  }}
                  disabled={!cancelReason || cancelShiftMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {cancelShiftMutation.isPending ? 'Cancelling...' : 'Cancel Shift'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyDiary;