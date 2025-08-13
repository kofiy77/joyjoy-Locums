import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface LocumShiftCardProps {
  shift: {
    id: string;
    shiftRef: string;
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: string | number;
    practiceName: string;
    practiceAddress: string;
    practicePostcode: string;
    additionalNotes?: string;
    status: string;
  };
  onViewDetails: (shiftId: string) => void;
  onBookShift?: (shiftId: string) => void;
}

const LocumShiftCard: React.FC<LocumShiftCardProps> = ({ shift, onViewDetails, onBookShift }) => {
  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    
    // Handle different time formats
    if (timeString.includes(':')) {
      return timeString;
    }
    
    // Convert 24-hour format to readable time
    const hour = parseInt(timeString);
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    
    return timeString;
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour - startHour;
  };

  const calculateTotalPay = () => {
    const duration = calculateDuration(shift.startTime, shift.endTime);
    const rate = typeof shift.hourlyRate === 'string' ? parseFloat(shift.hourlyRate) : shift.hourlyRate;
    return duration * rate;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return {
        dayName: format(date, 'EEE'),
        dayNumber: format(date, 'd'),
        month: format(date, 'MMM'),
        year: format(date, 'yyyy')
      };
    } catch {
      return {
        dayName: 'Wed',
        dayNumber: '23',
        month: 'Jul',
        year: '2025'
      };
    }
  };

  const dateInfo = formatDate(shift.date);
  const rate = typeof shift.hourlyRate === 'string' ? parseFloat(shift.hourlyRate) : shift.hourlyRate;

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header with Logo/Brand */}
      <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-center">
        <div className="text-xl font-bold text-medical-blue tracking-tight">
          JoyJoy
        </div>
      </div>

      <CardContent className="p-4">
        {/* Date Display */}
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-gray-900">
            {dateInfo.dayName} {dateInfo.dayNumber} {dateInfo.month} {dateInfo.year}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start mb-4">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-gray-700 min-h-[40px]">
            <div className="font-medium text-gray-900">{shift.practiceName}</div>
            <div className="text-gray-500 text-xs mt-0.5">
              {shift.practiceAddress?.split(',')[0] || 'Location'}
            </div>
          </div>
        </div>

        {/* Rate Information */}
        <div className="mb-4">
          <div className="text-xl font-bold text-gray-900">
            £{rate.toFixed(2)}/hr
          </div>
          <div className="text-sm text-gray-600">
            Total: £{calculateTotalPay().toFixed(2)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        {/* Primary Action Button */}
        {shift.status === 'open' && onBookShift ? (
          <Button 
            onClick={() => onBookShift(shift.id)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded"
            size="default"
          >
            Book Now
          </Button>
        ) : (
          <Button 
            onClick={() => onBookShift && onBookShift(shift.id)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded"
            size="default"
          >
            Book Now
          </Button>
        )}
        
        {/* Secondary Action Button */}
        <Button 
          variant="ghost" 
          onClick={() => onViewDetails(shift.id)}
          className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 py-1.5 h-auto"
          size="sm"
        >
          View more
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LocumShiftCard;