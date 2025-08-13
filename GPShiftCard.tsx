import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, PoundSterling, CalendarDays, HandHeart, Handshake } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getPostcodeToCity, calculatePostcodeDistance, formatDistance } from '@/utils/location-utils';

interface GPShiftCardProps {
  shift: {
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
  };
  staffPostcode?: string;
  onBookNow: (shiftId: string) => void;
  onViewMore?: (shiftId: string) => void;
}

// Helper function to calculate shift duration
const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
};

// Helper function to format date nicely
const formatShiftDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, 'EEE, d MMM yyyy');
  } catch (error) {
    return dateString;
  }
};

// Helper function to determine shift type
const getShiftType = (startTime: string, endTime: string) => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  if (startHour >= 22 || endHour <= 6) return 'Night';
  if (startHour >= 17) return 'Evening';
  return 'Day';
};

// Helper function to get role icon - removed cartoon emojis for cleaner appearance
const getRoleIcon = (role: string) => {
  return null; // No icon displayed for cleaner card appearance
};

const GPShiftCard: React.FC<GPShiftCardProps> = ({
  shift,
  staffPostcode,
  onBookNow,
  onViewMore
}) => {
  const duration = calculateDuration(shift.startTime, shift.endTime);
  const totalEarnings = (parseFloat(shift.hourlyRate) * duration).toFixed(2);
  const shiftType = getShiftType(shift.startTime, shift.endTime);
  
  // Calculate distance from staff location if available
  const distance = staffPostcode && shift.practicePostcode 
    ? calculatePostcodeDistance(staffPostcode, shift.practicePostcode)
    : null;
  
  // Get city from practice postcode
  const practiceCity = getPostcodeToCity(shift.practicePostcode);
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-medical-blue">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-medical-blue text-lg leading-tight">
              {shift.role}
            </h3>
            <p className="text-gray-600 text-sm font-medium">{shift.practiceName}</p>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            {shift.shiftRef}
          </Badge>
        </div>

        {/* Shift Details */}
        <div className="space-y-3 flex-grow">
          {/* Date and Time */}
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="h-4 w-4 mr-2 text-medical-blue flex-shrink-0" />
            <span>{formatShiftDate(shift.date)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-medical-blue flex-shrink-0" />
            <span>{shift.startTime} - {shift.endTime} ({duration}h {shiftType})</span>
          </div>

          {/* Location */}
          <div className="flex items-start text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-medical-blue flex-shrink-0" />
            <div>
              <div>{practiceCity}, {shift.practicePostcode}</div>
              {distance && (
                <div className="text-xs text-gray-500 mt-1">
                  ~{formatDistance(distance)} away
                </div>
              )}
            </div>
          </div>

          {/* Earnings */}
          <div className="flex items-center text-sm">
            <PoundSterling className="h-4 w-4 mr-2 text-medical-blue flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-900">£{shift.hourlyRate}/hr</span>
              <span className="text-gray-600 ml-2">• Total: £{totalEarnings}</span>
            </div>
          </div>

          {/* Requirements */}
          {shift.additionalNotes && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <Handshake className="h-4 w-4 mr-2 mt-0.5 text-medical-blue flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-medical-blue mb-1">Requirements</p>
                  <p className="text-xs text-gray-700">{shift.additionalNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
          {onViewMore && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewMore(shift.id)}
              className="flex-1"
            >
              View more
            </Button>
          )}
          <Button 
            onClick={() => onBookNow(shift.id)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium"
            size="sm"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GPShiftCard;