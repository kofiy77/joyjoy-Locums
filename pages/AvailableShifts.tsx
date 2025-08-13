import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import GPShiftCard from '@/components/GPShiftCard';
import ShiftDetailModal from '@/components/ShiftDetailModal';
import { useToast } from '@/hooks/use-toast';
import { calculatePostcodeDistance, getPostcodeToCity } from '@/utils/location-utils';
import StaffHeader from '@/components/StaffHeader';

interface Shift {
  id: string;
  shiftRef: string;
  practiceName: string;
  practiceAddress: string;
  practicePostcode: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: string;
  status: string;
  additionalNotes: string;
  staffRequired: number;
}

const AvailableShifts = () => {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [shiftTypeFilter, setShiftTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { toast } = useToast();

  // Fetch staff profile to get location
  const { data: staffProfile } = useQuery({
    queryKey: ['/api/staff/profile'],
    queryFn: async () => {
      const response = await apiRequest('/api/staff/profile');
      return await response.json();
    }
  });

  // Fetch available shifts
  const { data: shifts = [], isLoading, refetch } = useQuery<Shift[]>({
    queryKey: ['/api/shifts/available'],
    queryFn: async () => {
      const response = await apiRequest('/api/shifts/available');
      return await response.json();
    }
  });

  // Get unique values for filters
  const uniqueRoles = useMemo(() => {
    if (!Array.isArray(shifts)) return [];
    return Array.from(new Set(shifts.map((shift: Shift) => shift.role)));
  }, [shifts]);
  
  const uniqueLocations = useMemo(() => {
    if (!Array.isArray(shifts)) return [];
    return Array.from(new Set(shifts.map((shift: Shift) => shift.practiceName)));
  }, [shifts]);

  // Filter and sort shifts
  const filteredShifts = useMemo(() => {
    if (!Array.isArray(shifts)) return [];
    
    let filtered = shifts.filter((shift: Shift) => {
      // Search term filter (includes postcode search)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesRole = shift.role.toLowerCase().includes(term);
        const matchesPractice = shift.practiceName.toLowerCase().includes(term);
        const matchesPostcode = shift.practicePostcode.toLowerCase().includes(term);
        const matchesCity = getPostcodeToCity(shift.practicePostcode).toLowerCase().includes(term);
        
        if (!matchesRole && !matchesPractice && !matchesPostcode && !matchesCity) {
          return false;
        }
      }

      // Location search filter (specific postcode/city search)
      if (locationSearch) {
        const term = locationSearch.toLowerCase();
        const matchesPostcode = shift.practicePostcode.toLowerCase().includes(term);
        const matchesCity = getPostcodeToCity(shift.practicePostcode).toLowerCase().includes(term);
        
        if (!matchesPostcode && !matchesCity) {
          return false;
        }
      }

      // Role filter
      if (roleFilter !== 'all' && shift.role !== roleFilter) {
        return false;
      }

      // Location filter
      if (locationFilter !== 'all' && shift.practiceName !== locationFilter) {
        return false;
      }

      // Date filter - only apply if a date is specifically selected
      if (selectedDate) {
        const shiftDate = new Date(shift.date).toDateString();
        const filterDate = selectedDate.toDateString();
        if (shiftDate !== filterDate) {
          return false;
        }
      }

      return true;
    });
    
    // Sort by distance if staff postcode is available
    if (staffProfile?.postcode) {
      filtered.sort((a, b) => {
        const distanceA = calculatePostcodeDistance(staffProfile.postcode, a.practicePostcode);
        const distanceB = calculatePostcodeDistance(staffProfile.postcode, b.practicePostcode);
        return distanceA - distanceB;
      });
    }
    
    return filtered;
  }, [shifts, searchTerm, locationSearch, roleFilter, shiftTypeFilter, locationFilter, selectedDate, staffProfile?.postcode]);

  const handleSearch = () => {
    refetch();
  };

  const handleViewMore = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      setSelectedShift(shift);
      setIsModalOpen(true);
    }
  };

  const handleBookNow = async (shiftId: string) => {
    try {
      const response = await apiRequest(`/api/shifts/${shiftId}/book`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book shift');
      }
      
      toast({
        title: "Success",
        description: "Shift booked successfully! Check 'My Shifts' to view details."
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book shift",
        variant: "destructive"
      });
    }
  };

  const handleBookShift = async (shiftId: string) => {
    try {
      const response = await apiRequest(`/api/shifts/${shiftId}/book`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book shift');
      }
      
      toast({
        title: "Success",
        description: "Shift booked successfully! Check 'My Shifts' to view details."
      });
      setIsModalOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book shift",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader activeTab="available-shifts" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading available shifts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader activeTab="available-shifts" />
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Available Shifts</h1>
              <p className="text-gray-600 mt-1">Find and book shifts that match your availability</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {filteredShifts.length} shifts available
              </span>
            </div>
          </div>

          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Role Selection */}
            <div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pharmacist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                  <SelectItem value="Nurse Practitioner">Nurse Practitioner</SelectItem>
                  <SelectItem value="Practice Nurse">Practice Nurse</SelectItem>
                  <SelectItem value="Locum GP">Locum GP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "d MMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="w-full"
                      >
                        Clear Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Location Search */}
            <div className="relative">
              <Search className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Postcode or City"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="h-12 pl-10"
              />
            </div>

            {/* Search Button */}
            <Button 
              onClick={handleSearch}
              className="h-12 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search roles, care homes, cities, or postcodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Practice Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Practices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practices</SelectItem>
                {uniqueLocations.map(practice => (
                  <SelectItem key={practice} value={practice}>{practice}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setShiftTypeFilter('all');
                setLocationFilter('all');
                setSelectedRole('all');
                setSelectedDate(undefined);
                setLocationSearch('');
              }}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear All</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Shift Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
            <p className="text-gray-600 mb-6">
              {!Array.isArray(shifts) || shifts.length === 0 
                ? "There are currently no available shifts."
                : "No shifts match your current filters. Try adjusting your search criteria."
              }
            </p>
            {Array.isArray(shifts) && shifts.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setShiftTypeFilter('all');
                  setLocationFilter('all');
                  setSelectedRole('all');
                  setSelectedDate(undefined);
                  setLocationSearch('');
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShifts.map((shift: Shift) => (
              <GPShiftCard
                key={shift.id}
                shift={shift}
                staffPostcode={staffProfile?.postcode}
                onBookNow={handleBookNow}
                onViewMore={handleViewMore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        shift={selectedShift}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookShift={handleBookShift}
      />
    </div>
  );
};

export default AvailableShifts;