import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Calendar, User, Building, Share2, X, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import InteractiveMap from './InteractiveMap';

interface ShiftDetailModalProps {
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
    // Legacy fields for backward compatibility
    careHomeName?: string;
    type?: string;
    timeRange?: string;
    requiredSkills?: string[];
    internalRate?: string;
    externalRate?: string;
    careHomeAddress?: string;
    careHomePostcode?: string;
    assignmentStatus?: string;
    shiftDate?: Date;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onBookShift?: (shiftId: string) => void;
  onCancelShift?: (shiftId: string) => void;
  isBookedShift?: boolean;
}

const ShiftDetailModal: React.FC<ShiftDetailModalProps> = ({
  shift,
  isOpen,
  onClose,
  onBookShift,
  onCancelShift,
  isBookedShift = false
}) => {
  if (!shift) return null;

  const shiftDate = parseISO(shift.date);
  const dayName = format(shiftDate, 'EEE dd MMM yyyy');
  
  // Use GP practice fields or fallback to legacy fields
  const practiceName = shift.practiceName || shift.careHomeName || '';
  const practiceAddress = shift.practiceAddress || shift.careHomeAddress || '';
  const practicePostcode = shift.practicePostcode || shift.careHomePostcode || '';
  const hourlyRate = parseFloat(shift.hourlyRate || shift.internalRate || '0');
  
  // Calculate duration and total from start/end times or use legacy timeRange
  const calculateDuration = () => {
    if (shift.startTime && shift.endTime) {
      const start = new Date(`2000-01-01T${shift.startTime}:00`);
      const end = new Date(`2000-01-01T${shift.endTime}:00`);
      if (end < start) end.setDate(end.getDate() + 1);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    // Fallback to legacy calculation
    if (shift.timeRange) {
      const [start, end] = shift.timeRange.split('-');
      if (start && end) {
        const startHour = parseInt(start.split(':')[0]);
        const endHour = parseInt(end.split(':')[0]);
        return endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
      }
    }
    return 8; // Default
  };
  
  const hours = calculateDuration();
  const totalAmount = parseFloat(shift.externalRate || '0') || (hourlyRate * hours);
  
  // Get shift type from times
  const getShiftType = () => {
    if (shift.type) return shift.type;
    if (shift.startTime) {
      const startHour = parseInt(shift.startTime.split(':')[0]);
      if (startHour >= 22 || startHour < 6) return 'Night';
      if (startHour >= 17) return 'Evening';
      return 'Day';
    }
    return 'Day';
  };
  
  const shiftType = getShiftType();
  
  // Check if shift can be cancelled (24 hours before start)
  const canCancel = () => {
    if (!isBookedShift) return false;
    const now = new Date();
    const hoursUntilShift = (shiftDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilShift > 24;
  };
  
  // Get status for display
  const getShiftStatus = () => {
    if (shift.assignmentStatus) return shift.assignmentStatus;
    if (shift.status) return shift.status;
    return 'open';
  };
  
  const status = getShiftStatus();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastShift = shift.shiftDate && shift.shiftDate < today;
  
  // Debug logging
  console.log('🔍 ShiftDetailModal Debug:', {
    shiftId: shift.id,
    isBookedShift,
    status,
    assignmentStatus: shift.assignmentStatus,
    shiftStatus: shift.status,
    isPastShift,
    canCancelResult: canCancel(),
    shiftDate: shift.shiftDate
  });



  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${shift.role} at ${practiceName}`,
        text: `${shiftType} shift on ${dayName} - £${hourlyRate}/hr`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(
        `${shift.role} at ${practiceName} - ${shiftType} shift on ${dayName} - £${hourlyRate}/hr`
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-medical-blue">
              {shift.role} at {practiceName}
            </DialogTitle>
            <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <span>Shift ID: {shift.shiftRef}</span>
              <Badge variant="outline">{shiftType}</Badge>
              {isBookedShift && (
                <Badge className={
                  isPastShift 
                    ? status === 'cancelled' 
                      ? 'bg-gray-100 text-gray-600' 
                      : 'bg-blue-100 text-blue-800'
                    : status === 'booked' || status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                }>
                  {isPastShift 
                    ? status === 'cancelled' ? 'Cancelled' : 'Worked'
                    : status === 'booked' || status === 'accepted' ? 'Booked' : status
                  }
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left Column - Shift Details */}
          <div className="space-y-6">
            {/* Date and Time */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-medical-blue" />
                Schedule
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium">{dayName}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {shift.startTime && shift.endTime 
                    ? `${shift.startTime} - ${shift.endTime}` 
                    : shift.timeRange || 'Time TBC'
                  }
                  <span className="ml-2 text-sm">({hours} hours)</span>
                </div>
              </div>
            </div>

            {/* Rate Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Payment Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Hourly rate:</span>
                  <span className="font-bold text-lg">
                    £{hourlyRate.toFixed(2)}/hr
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total payment:</span>
                  <span className="font-bold text-lg text-medical-blue">
                    £{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Includes {hours} hours work
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="h-5 w-5 mr-2 text-medical-blue" />
                Practice Details
              </h3>
              <div className="space-y-2">
                <div className="font-medium">{practiceName}</div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{practiceAddress}</div>
                    <div className="font-medium">{practicePostcode}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {shift.additionalNotes && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-medical-blue" />
                  Requirements
                </h3>
                <p className="text-gray-700">{shift.additionalNotes}</p>
              </div>
            )}
            
            {/* Legacy Required Skills support */}
            {shift.requiredSkills && shift.requiredSkills.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-medical-blue" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {shift.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Shift Intelligence */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                ⭐ Shift Rate Intelligence
              </h3>
              <p className="text-sm text-blue-800">
                This shift offers competitive rates for {shiftType} shifts in this area. 
                The hourly rate is above average for {shift.role} positions.
              </p>
            </div>
          </div>

          {/* Right Column - Map and Actions */}
          <div className="space-y-6">
            {/* Interactive Map */}
            <InteractiveMap
              practiceName={practiceName}
              practiceAddress={practiceAddress}
              practicePostcode={practicePostcode}
              careHomeName={shift.careHomeName}
              address={shift.careHomeAddress}
              postcode={shift.careHomePostcode}
              className="h-64"
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isBookedShift ? (
                <>
                  <Button 
                    onClick={() => {
                      console.log('🔍 Book Now button clicked:', shift.id, 'onBookShift:', !!onBookShift);
                      onBookShift && onBookShift(shift.id);
                    }}
                    className="w-full bg-medical-blue hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    Book Now
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    size="lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share this shift
                  </Button>
                </>
              ) : (
                <>
                  {/* Booked shift actions */}
                  {!isPastShift && (status === 'booked' || status === 'accepted') && (
                    <>
                      {canCancel() ? (
                        <Button 
                          onClick={() => onCancelShift && onCancelShift(shift.id)}
                          variant="destructive"
                          className="w-full py-3"
                          size="lg"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel Shift
                        </Button>
                      ) : (
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center text-orange-800 mb-2">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span className="font-medium text-sm">Less than 24 hours notice</span>
                          </div>
                          <p className="text-sm text-orange-700 mb-2">
                            Please contact staff support to cancel this shift
                          </p>
                          <div className="text-xs text-orange-600">
                            📞 0800 123 4567 | 📧 support@joyjoycare.co.uk
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    size="lg"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share shift details
                  </Button>
                </>
              )}
            </div>

            {/* Additional Information */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Application Process</h4>
              <p className="text-sm text-blue-800 mb-3">
                To be considered for this shift, ensure you have uploaded all necessary compliance documents to your profile.
              </p>
              <div className="space-y-1 text-xs text-blue-700">
                <div>• DBS Certificate (Enhanced)</div>
                <div>• Right to Work Documentation</div>
                <div>• Professional References</div>
                <div>• Relevant Certifications</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                If you have questions about this shift, contact our support team.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftDetailModal;