import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Navigation } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getPostcodeToCity, calculatePostcodeDistance, formatDistance } from '@/utils/location-utils';

interface ShiftBookingCardProps {
  shift: {
    id: string;
    shiftRef: string;
    careHomeName: string;
    role: string;
    date: string;
    type: string;
    timeRange: string;
    requiredSkills: string[];
    internalRate: string;
    externalRate: string;
    careHomeAddress: string;
    careHomePostcode: string;
  };
  staffPostcode?: string;
  onBookNow: (shiftId: string) => void;
  onViewMore?: (shiftId: string) => void;
}

// Company logos for different care home chains (placeholder)
const getCompanyLogo = (careHomeName: string) => {
  const name = careHomeName.toLowerCase();
  if (name.includes('boots') || name.includes('pharmacy')) return '🏪';
  if (name.includes('care') || name.includes('home')) return '🏠';
  if (name.includes('manor') || name.includes('house')) return '🏛️';
  if (name.includes('gardens') || name.includes('meadows')) return '🌿';
  return '🏥'; // Default healthcare icon
};

// Extract hourly rate from notes
const extractRateFromNotes = (notes?: string) => {
  if (!notes) return { hourlyRate: 0, totalAmount: 0 };
  
  const rateMatch = notes.match(/Rate: £([\d.]+)\/hr/);
  const totalMatch = notes.match(/Total: £([\d.]+)/);
  
  return {
    hourlyRate: rateMatch ? parseFloat(rateMatch[1]) : 0,
    totalAmount: totalMatch ? parseFloat(totalMatch[1]) : 0
  };
};

// Calculate shift duration in hours
const calculateHours = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60)); // Convert to hours
};

const ShiftBookingCard: React.FC<ShiftBookingCardProps> = ({
  shift,
  staffPostcode,
  onBookNow,
  onViewMore
}) => {
  // Calculate realistic rates based on role and shift type if not provided
  const calculateRealRate = () => {
    let baseRate = 25.0; // Default rate
    
    // Role-based rates
    switch (shift.role?.toLowerCase()) {
      case 'healthcare assistant':
      case 'care assistant':
        baseRate = shift.type === 'night' ? 22.50 : 16.50;
        break;
      case 'registered nurse':
      case 'nurse':
        baseRate = shift.type === 'night' ? 38.50 : 28.50;
        break;
      case 'support worker':
        baseRate = shift.type === 'night' ? 20.00 : 15.00;
        break;
      case 'senior carer':
        baseRate = shift.type === 'night' ? 25.00 : 18.50;
        break;
      default:
        baseRate = shift.type === 'night' ? 22.50 : 16.50;
    }
    
    return baseRate;
  };
  
  // Extract hours from timeRange (e.g., "07:00-19:00" = 12 hours)
  const getHoursFromTimeRange = (timeRange: string) => {
    const [start, end] = timeRange.split('-');
    if (!start || !end) return 8; // Default 8 hours
    
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    
    if (endHour > startHour) {
      return endHour - startHour;
    } else {
      // Overnight shift
      return (24 - startHour) + endHour;
    }
  };
  
  const hours = getHoursFromTimeRange(shift.timeRange);
  const hourlyRate = parseFloat(shift.internalRate) || calculateRealRate();
  const totalAmount = parseFloat(shift.externalRate) || (hourlyRate * hours);
  
  // Calculate distance from staff location if available
  const distance = staffPostcode && shift.careHomePostcode 
    ? calculatePostcodeDistance(staffPostcode, shift.careHomePostcode)
    : null;
  
  // Get town/city from care home postcode
  const careHomeCity = getPostcodeToCity(shift.careHomePostcode);
  
  // Format date
  const shiftDate = parseISO(shift.date);
  const dayName = format(shiftDate, 'EEE');
  const dateStr = format(shiftDate, 'd MMM yyyy');
  
  // Format time
  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'HH:mm a');
  };

  // Determine if this is a premium shift (evening/night/weekend)
  const isPremium = shift.type === 'night' || shift.type === 'evening' || 
                   shiftDate.getDay() === 0 || shiftDate.getDay() === 6;

  return (
    <Card className="w-full max-w-sm bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Company Logo & Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center text-white text-xs font-bold">
              {shift.careHomeName.split(' ').map((word: string) => word[0]).join('').slice(0, 3).toUpperCase()}
            </div>
            {isPremium && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                ⭐ Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900">{dayName} {dateStr}</h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Clock className="w-4 h-4 mr-1" />
            {shift.timeRange}
          </div>
        </div>

        {/* Location */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{shift.careHomeName}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{careHomeCity}</span>
            {distance && (
              <div className="flex items-center">
                <Navigation className="w-3 h-3 mr-1" />
                <span>{formatDistance(distance)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            {shift.role}
          </Badge>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="text-lg font-bold text-gray-900">
            £{hourlyRate.toFixed(2)}/hr
          </div>
          <div className="text-sm text-gray-600">
            Total: £{totalAmount.toFixed(2)} ({hours}h)
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={() => onBookNow(shift.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Book Now
          </Button>
          
          {onViewMore && (
            <Button 
              onClick={() => onViewMore(shift.id)}
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              View more
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftBookingCard;