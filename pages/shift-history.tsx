import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Star, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StaffHeader from "@/components/StaffHeader";

export default function ShiftHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  // Fetch historical shifts using the new history endpoint
  const { data: shifts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/staff/history']
  });

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ shiftId, feedback, rating }: any) => {
      return apiRequest(`/api/shifts/${shiftId}/feedback`, 'POST', { feedback, rating });
    },
    onSuccess: () => {
      toast({ title: "Feedback submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/shifts/history'] });
      setShowFeedbackDialog(false);
      setFeedback("");
      setRating(0);
      setSelectedShift(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'no-show':
        return <Badge className="bg-red-100 text-red-800">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canProvideFeedback = (shift: any) => {
    if (shift.status !== 'completed') return false;
    const shiftDate = new Date(shift.shiftDate);
    const now = new Date();
    return shiftDate < now && !shift.feedbackProvided;
  };

  const handleFeedbackSubmit = () => {
    if (!selectedShift || rating === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      shiftId: selectedShift.id,
      feedback,
      rating
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader activeTab="history" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading shift history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader activeTab="history" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shift History</h1>
          <p className="text-gray-600 mt-2">View your completed and past shifts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Shifts</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {shifts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Hours</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {shifts.reduce((total: number, shift: any) => {
                      const start = new Date(`2000-01-01 ${shift.startTime}`);
                      const end = new Date(`2000-01-01 ${shift.endTime}`);
                      let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      if (hours < 0) hours += 24;
                      return total + hours;
                    }, 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {shifts.filter((s: any) => s.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {shifts.filter((s: any) => s.status === 'cancelled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shift History */}
        {shifts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shift history</h3>
              <p className="text-gray-500">You haven't completed any shifts yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift: any) => (
              <Card key={shift.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {shift.role}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(shift.status)}
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          £{shift.hourlyRate}/hr
                        </Badge>
                      </div>
                    </div>
                    {canProvideFeedback(shift) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedShift(shift);
                          setShowFeedbackDialog(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Provide Feedback
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {formatDate(shift.shiftDate)}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      {shift.startTime} - {shift.endTime}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      {shift.careHomeName || 'Care Home'}
                    </div>
                  </div>

                  {shift.requiredSkills && shift.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {shift.requiredSkills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {shift.cancellationReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Cancelled:</strong> {shift.cancellationReason}
                      </p>
                      {shift.cancellationDetails && (
                        <p className="text-sm text-red-700 mt-1">{shift.cancellationDetails}</p>
                      )}
                    </div>
                  )}

                  {shift.feedback && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Your Feedback</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= shift.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{shift.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Provide Shift Feedback</DialogTitle>
              <DialogDescription>
                Share your experience about this shift to help us improve our service.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Rating (1-5 stars) *</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Comments (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts about the shift, care home, or any suggestions..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackDialog(false);
                    setFeedback("");
                    setRating(0);
                    setSelectedShift(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackMutation.isPending || rating === 0}
                >
                  {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}