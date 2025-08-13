import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Eye, AlertCircle, Filter, Search, Phone, PoundSterling, X, CalendarDays, HeartHandshake, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BookedShift {
  id: string;
  shiftRef: string;
  practiceName: string;
  practiceAddress: string;
  practicePostcode: string;
  practicePhone: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: string;
  status: string;
  additionalNotes?: string;
}

type ShiftStatus = 'all' | 'booked' | 'completed' | 'cancelled';

export default function MyShiftsRedesigned() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<ShiftStatus>('all');
  const [practiceFilter, setPracticeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Modal state
  const [selectedShift, setSelectedShift] = useState<BookedShift | null>(null);
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch booked shifts
  const { data: shifts = [], isLoading } = useQuery<BookedShift[]>({
    queryKey: ['/api/my-shifts'],
    queryFn: async () => {
      const response = await apiRequest('/api/my-shifts');
      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }
      return response.json();
    }
  });

  // Calculate shift duration
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 ? diffHours : diffHours + 24; // Handle overnight shifts
  };

  // Calculate total earnings
  const calculateTotal = (hourlyRate: string, duration: number): string => {
    return (parseFloat(hourlyRate) * duration).toFixed(2);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-UK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get unique practices for filter
  const uniquePractices = Array.from(new Set(shifts.map(shift => shift.practiceName)));

  // Filter shifts based on current filters
  const filteredShifts = shifts.filter(shift => {
    const matchesStatus = statusFilter === 'all' || shift.status === statusFilter;
    const matchesPractice = practiceFilter === 'all' || shift.practiceName === practiceFilter;
    const matchesSearch = searchTerm === '' || 
      shift.practiceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.shiftRef.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filtering
    let matchesDateRange = true;
    if (dateFrom) {
      matchesDateRange = matchesDateRange && new Date(shift.date) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && new Date(shift.date) <= new Date(dateTo);
    }

    return matchesStatus && matchesPractice && matchesSearch && matchesDateRange;
  });

  // Get status counts for sidebar
  const statusCounts = {
    all: shifts.length,
    booked: shifts.filter(s => s.status === 'booked' || s.status === 'assigned').length,
    completed: shifts.filter(s => s.status === 'completed').length,
    cancelled: shifts.filter(s => s.status === 'cancelled').length
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('all');
    setPracticeFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
      case 'assigned':
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Booked</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-600 border-gray-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Open shift details modal
  const openShiftDetails = (shift: BookedShift) => {
    setSelectedShift(shift);
    setShowShiftDetails(true);
  };

  // Format date for detailed display
  const formatFullDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Open cancel dialog
  const openCancelDialog = (shift: BookedShift) => {
    setSelectedShift(shift);
    setShowCancelDialog(true);
  };

  // Cancel shift mutation
  const cancelShiftMutation = useMutation({
    mutationFn: async ({ shiftId, reason }: { shiftId: string; reason: string }) => {
      const response = await apiRequest(`/api/shifts/${shiftId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel shift');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-shifts'] });
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedShift(null);
      toast({ title: 'Shift cancelled successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to cancel shift', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  // Check if shift can be cancelled (all future shifts)
  const canCancelShift = (shift: BookedShift): boolean => {
    const shiftDate = new Date(shift.date);
    const now = new Date();
    const hoursDiff = (shiftDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Debug logging
    console.log(`Checking cancellation for shift ${shift.shiftRef}:`, {
      shiftDate: shiftDate.toISOString(),
      now: now.toISOString(),
      hoursDiff,
      status: shift.status,
      canCancel: hoursDiff > 0 && ['booked', 'accepted', 'assigned', 'confirmed'].includes(shift.status)
    });
    
    // Show cancel button on all future shifts (more than 0 hours in the future)
    return hoursDiff > 0 && ['booked', 'accepted', 'assigned', 'confirmed'].includes(shift.status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
        <span className="ml-2 text-gray-600">Loading shifts...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-50 lg:hidden bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Left Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-60 xl:w-64 overflow-y-auto`}>
          <div className="space-y-4 lg:space-y-6">
            {/* Status Filters */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter by Status</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                    statusFilter === 'all' ? 'bg-medical-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>All Shifts</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === 'all' ? 'bg-white text-medical-blue' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {statusCounts.all}
                  </span>
                </button>
                
                <button
                  onClick={() => setStatusFilter('booked')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                    statusFilter === 'booked' ? 'bg-medical-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Booked Shifts</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === 'booked' ? 'bg-white text-medical-blue' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {statusCounts.booked}
                  </span>
                </button>
                
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                    statusFilter === 'completed' ? 'bg-medical-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Completed</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === 'completed' ? 'bg-white text-medical-blue' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {statusCounts.completed}
                  </span>
                </button>
                
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                    statusFilter === 'cancelled' ? 'bg-medical-blue text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>Cancelled</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    statusFilter === 'cancelled' ? 'bg-white text-medical-blue' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {statusCounts.cancelled}
                  </span>
                </button>
              </div>
            </div>

            {/* Practice Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Practice</h3>
              <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Practices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Practices</SelectItem>
                  {uniquePractices.map(practice => (
                    <SelectItem key={practice} value={practice}>{practice}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Date Range</h3>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From date"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To date"
                />
              </div>
            </div>

            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="w-full"
            >
              Reset my filters
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto max-w-full">
          {/* Mobile Header with Menu Button */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="mb-4"
            >
              <Menu className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Header */}
          <div className="mb-4 lg:mb-6">
            <p className="text-gray-600 text-sm lg:text-base">View your scheduled and completed shifts</p>
            {filteredShifts && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredShifts.length} shift{filteredShifts.length !== 1 ? 's' : ''}
                </Badge>
                <span className="text-xs lg:text-sm text-gray-500 ml-2">Page 1 of 1</span>
              </div>
            )}
          </div>

        {/* Shifts Grid */}
        {filteredShifts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <HeartHandshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No shifts found</h3>
              <p className="text-gray-500">
                {shifts.length === 0 
                  ? "You haven't booked any shifts yet."
                  : "No shifts match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2">
            {filteredShifts.map((shift) => {
              const duration = calculateDuration(shift.startTime, shift.endTime);
              const total = calculateTotal(shift.hourlyRate, duration);
              
              return (
                <Card key={shift.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-medical-blue min-h-[250px] w-full">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 mr-4">
                        <CardTitle className="text-xl font-semibold text-medical-blue">
                          {shift.role}
                        </CardTitle>
                        <CardDescription className="font-medium text-lg mt-1">
                          {shift.practiceName}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                          {shift.shiftRef}
                        </Badge>
                        {getStatusBadge(shift.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center text-base text-gray-600">
                          <CalendarDays className="h-5 w-5 mr-3 text-medical-blue flex-shrink-0" />
                          <span>{formatDate(shift.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-base text-gray-600">
                          <Clock className="h-5 w-5 mr-3 text-medical-blue flex-shrink-0" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Duration: {duration}h
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start text-base text-gray-600">
                          <MapPin className="h-5 w-5 mr-3 mt-0.5 text-medical-blue flex-shrink-0" />
                          <div className="min-w-0">
                            <div>{shift.practiceAddress || 'Address not available'}</div>
                            {shift.practicePostcode && <div className="text-gray-500 mt-1">{shift.practicePostcode}</div>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-base text-gray-600">
                          <PoundSterling className="h-5 w-5 mr-3 text-medical-blue flex-shrink-0" />
                          <div>
                            <div className="font-semibold">£{shift.hourlyRate}/hr</div>
                            <div className="text-sm text-gray-500">Total: £{total}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <Separator className="mb-4" />
                      <div className="flex gap-4">
                        <Button
                          onClick={() => openShiftDetails(shift)}
                          variant="outline"
                          size="lg"
                          className="flex-1 border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white text-base py-3"
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          View
                        </Button>
                        {canCancelShift(shift) && (
                          <Button
                            onClick={() => openCancelDialog(shift)}
                            variant="outline"
                            size="lg"
                            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 text-base py-3"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Shift Details Modal */}
      <Dialog open={showShiftDetails} onOpenChange={setShowShiftDetails}>
        <DialogContent className="max-w-2xl">
          {selectedShift && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-xl font-bold text-medical-blue">
                      {selectedShift.role}
                    </DialogTitle>
                    <DialogDescription className="text-base font-medium mt-1">
                      {selectedShift.practiceName}
                    </DialogDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {selectedShift.shiftRef}
                    </Badge>
                    {getStatusBadge(selectedShift.status)}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Shift Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <CalendarDays className="h-5 w-5 mr-3 text-medical-blue" />
                      <div>
                        <p className="font-semibold">Date</p>
                        <p className="text-sm">{formatFullDate(selectedShift.date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-3 text-medical-blue" />
                      <div>
                        <p className="font-semibold">Time</p>
                        <p className="text-sm">
                          {selectedShift.startTime} - {selectedShift.endTime}
                          ({calculateDuration(selectedShift.startTime, selectedShift.endTime)}h)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <PoundSterling className="h-5 w-5 mr-3 text-medical-blue" />
                      <div>
                        <p className="font-semibold">Rate</p>
                        <p className="text-sm">£{selectedShift.hourlyRate} per hour</p>
                        <p className="text-sm font-medium text-medical-blue">
                          Total: £{calculateTotal(
                            selectedShift.hourlyRate, 
                            calculateDuration(selectedShift.startTime, selectedShift.endTime)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Practice Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Practice Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-5 w-5 mr-3 mt-0.5 text-medical-blue flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-sm">{selectedShift.practiceAddress || 'Address not available'}</p>
                        {selectedShift.practicePostcode && (
                          <p className="text-sm">{selectedShift.practicePostcode}</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedShift.practicePhone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-3 text-medical-blue" />
                        <div>
                          <p className="font-semibold">Phone</p>
                          <p className="text-sm">{selectedShift.practicePhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {selectedShift.additionalNotes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h3>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">
                        {selectedShift.additionalNotes}
                      </p>
                    </div>
                  </>
                )}

                {/* Disabled booking button for already booked shifts */}
                <div className="flex gap-3 pt-4">
                  <Button
                    disabled
                    className="flex-1 bg-gray-300 text-gray-500 cursor-not-allowed"
                  >
                    Already Booked
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowShiftDetails(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Shift</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this shift
            </DialogDescription>
          </DialogHeader>
          
          {selectedShift && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Shift Details</div>
                <div className="text-sm text-gray-600">
                  <Badge className="mr-2">{selectedShift.shiftRef}</Badge>
                  {selectedShift.role} at {selectedShift.practiceName}<br />
                  {formatFullDate(selectedShift.date)} • {selectedShift.startTime} - {selectedShift.endTime}
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
}