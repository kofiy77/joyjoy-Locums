import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, MapPin, HeartHandshake, PoundSterling } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AvailableShift {
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-UK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function calculateShiftDuration(startTime: string, endTime: string) {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return diffHours;
}

function calculateEarnings(hourlyRate: string, duration: number) {
  return (parseFloat(hourlyRate) * duration).toFixed(2);
}

export default function BookShifts() {
  const queryClient = useQueryClient();

  const { data: availableShifts, isLoading } = useQuery<AvailableShift[]>({
    queryKey: ["/api/shifts/available"],
    staleTime: 30000, // Refresh every 30 seconds for real-time availability
  });

  const bookShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      return apiRequest(`/api/shifts/${shiftId}/book`, {
        method: "POST"
      });
    },
    onSuccess: () => {
      toast({
        title: "Shift Booked Successfully",
        description: "The shift has been assigned to you. Check 'My Shifts' to view details.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shifts/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shifts/my-shifts"] });
      queryClient.refetchQueries({ queryKey: ["/api/shifts/my-shifts"] });
      console.log('🔄 BookShifts cache invalidated - all shift queries refreshed');
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book this shift. It may have been taken by another locum.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-medical-blue">Available Shifts</h1>
          <p className="text-gray-600 mt-2">Loading available shifts...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-medical-blue">Available Shifts</h1>
        <p className="text-gray-600 mt-2">
          Book shifts that match your schedule and preferences
        </p>
        {availableShifts && (
          <Badge variant="secondary" className="mt-2">
            {availableShifts.length} available shifts
          </Badge>
        )}
      </div>

      {!availableShifts || availableShifts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <HeartHandshake className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Available Shifts</h3>
            <p className="text-gray-500">
              There are currently no available shifts. Check back later or contact us for more opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableShifts.map((shift) => {
            const duration = calculateShiftDuration(shift.startTime, shift.endTime);
            const earnings = calculateEarnings(shift.hourlyRate, duration);
            
            return (
              <Card key={shift.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-medical-blue">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-medical-blue">
                        {shift.role}
                      </CardTitle>
                      <CardDescription className="font-medium">
                        {shift.practiceName}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {shift.shiftRef}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4 mr-2 text-medical-blue" />
                      <span>{formatDate(shift.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-medical-blue" />
                      <span>{shift.startTime} - {shift.endTime} ({duration}h)</span>
                    </div>
                    
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-medical-blue flex-shrink-0" />
                      <span>{shift.practiceAddress}, {shift.practicePostcode}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <PoundSterling className="h-4 w-4 mr-2 text-medical-blue" />
                      <span className="font-semibold">£{shift.hourlyRate}/hr • Total: £{earnings}</span>
                    </div>
                  </div>

                  {shift.additionalNotes && (
                    <>
                      <Separator />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium mb-1">Requirements:</p>
                        <p>{shift.additionalNotes}</p>
                      </div>
                    </>
                  )}

                  <Separator />
                  
                  <Button 
                    onClick={() => bookShiftMutation.mutate(shift.id)}
                    disabled={bookShiftMutation.isPending}
                    className="w-full bg-medical-blue hover:bg-medical-blue-700"
                  >
                    {bookShiftMutation.isPending ? "Booking..." : "Book This Shift"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}