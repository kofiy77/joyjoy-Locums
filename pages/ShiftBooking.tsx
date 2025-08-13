import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ShiftBookingCard from '@/components/ShiftBookingCard';
import ShiftDetailModal from '@/components/ShiftDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Filter, Search, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface Shift {
  id: string;
  role: string;
  shift_date: string;
  shift_type: string;
  start_time: string;
  end_time: string;
  status: string;
  required_skills: string[];
  notes?: string;
  care_home: {
    id: string;
    name: string;
    address?: string;
  };
}

const ShiftBooking = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [detailModalShiftId, setDetailModalShiftId] = useState<string | null>(null);
  
  // Legacy filters for backward compatibility
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [shiftTypeFilter, setShiftTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  // Fetch available shifts
  const { data: shifts = [], isLoading, refetch } = useQuery<Shift[]>({
    queryKey: ['/api/shifts/available'],
    queryFn: async () => {
      const response = await fetch('/api/shifts/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch shifts');
      return response.json();
    }
  });

  // Advanced filtering based on new search interface
  const filteredShifts = shifts.filter(shift => {
    // Role filter
    const matchesRole = !selectedRole || selectedRole === 'all' || shift.role.toLowerCase().includes(selectedRole.toLowerCase());
    
    // Date filter
    const matchesDate = !selectedDate || shift.shift_date === format(selectedDate, 'yyyy-MM-dd');
    
    // Location filter (address or area search)
    const matchesLocation = !locationSearch || 
      shift.care_home.address?.toLowerCase().includes(locationSearch.toLowerCase()) ||
      shift.care_home.name.toLowerCase().includes(locationSearch.toLowerCase());

    // Legacy filters for backward compatibility
    const matchesLegacySearch = !searchTerm || 
      shift.care_home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLegacyRole = roleFilter === 'all' || shift.role === roleFilter;
    const matchesLegacyShiftType = shiftTypeFilter === 'all' || shift.shift_type === shiftTypeFilter;
    const matchesLegacyLocation = locationFilter === 'all' || shift.care_home.name === locationFilter;

    return matchesRole && matchesDate && matchesLocation && 
           matchesLegacySearch && matchesLegacyRole && matchesLegacyShiftType && matchesLegacyLocation;
  });

  // Perform search with current filters
  const handleSearch = () => {
    // This will trigger re-filtering with current values
    console.log('Searching with filters:', {
      role: selectedRole,
      date: selectedDate,
      location: locationSearch
    });
  };

  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(shifts.map(s => s.role)));
  const uniqueShiftTypes = Array.from(new Set(shifts.map(s => s.shift_type)));
  const uniqueLocations = Array.from(new Set(shifts.map(s => s.care_home.name)));

  const handleQuickApply = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}/select`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Successfully applied for shift!');
        refetch(); // Refresh the list
      } else {
        const error = await response.text();
        alert(`Failed to apply: ${error}`);
      }
    } catch (error) {
      console.error('Error applying for shift:', error);
      alert('Failed to apply for shift');
    }
  };

  const handleBookNow = (shiftId: string) => {
    handleQuickApply(shiftId); // For now, same as quick apply
  };

  const handleViewMore = (shiftId: string) => {
    setDetailModalShiftId(shiftId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available shifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Available Shifts</h1>
              <p className="text-gray-600 mt-1">Find and book shifts that match your availability</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredShifts.length} shifts available
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Search Interface */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Primary Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Role Selection */}
            <div>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pharmacist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
                  <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
                  <SelectItem value="support_worker">Support Worker</SelectItem>
                  <SelectItem value="senior_carer">Senior Carer</SelectItem>
                  <SelectItem value="care_assistant">Care Assistant</SelectItem>
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
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "d MMM yyyy") : "21 Jul 2025"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Location Search */}
            <div className="relative">
              <Search className="absolute left-3 top-4 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Location"
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

          {/* Advanced Filters */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Legacy Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations or roles..."
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

              {/* Shift Type Filter */}
              <Select value={shiftTypeFilter} onValueChange={setShiftTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Shift Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shift Types</SelectItem>
                  {uniqueShiftTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
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
                  setSelectedRole('');
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
      </div>

      {/* Shift Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredShifts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
            <p className="text-gray-600 mb-6">
              {shifts.length === 0 
                ? "There are currently no available shifts."
                : "No shifts match your current filters. Try adjusting your search criteria."
              }
            </p>
            {shifts.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setShiftTypeFilter('all');
                  setLocationFilter('all');
                  setSelectedRole('');
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
            {filteredShifts.map((shift) => (
              <ShiftBookingCard
                key={shift.id}
                shift={shift}
                onQuickApply={handleQuickApply}
                onBookNow={handleBookNow}
                onViewMore={handleViewMore}
              />
            ))}
          </div>
        )}
      </div>
      {/* Shift Detail Modal */}
      <ShiftDetailModal 
        shiftId={detailModalShiftId}
        isOpen={!!detailModalShiftId}
        onClose={() => setDetailModalShiftId(null)}
      />
    </div>
  );
};

export default ShiftBooking;