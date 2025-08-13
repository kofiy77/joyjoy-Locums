import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, MessageSquare, CheckCircle, XCircle, Clock, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AllocationCandidate {
  staffId: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  experience: number;
  hourlyRate: string;
  matchScore: number;
  matchReasons: string[];
  lastContacted?: string;
  responseStatus?: 'pending' | 'accepted' | 'declined' | 'no_response';
  contactNotes?: string;
}

interface AllocationReport {
  shiftId: string;
  shiftDetails: {
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    careHomeName: string;
    requiredSkills: string[];
    hourlyRate: string;
  };
  candidates: AllocationCandidate[];
  reportGenerated: string;
  status: 'draft' | 'in_progress' | 'completed';
}

export default function ManualAllocation() {
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [contactingStaffId, setContactingStaffId] = useState<string>("");
  const [contactNotes, setContactNotes] = useState("");
  const { toast } = useToast();

  const { data: openShifts, isLoading: shiftsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/shifts/open"],
  });

  const { data: allocationReport, isLoading: reportLoading } = useQuery<AllocationReport>({
    queryKey: ["/api/admin/allocation-report", selectedShift],
    enabled: !!selectedShift,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      return apiRequest('POST', `/api/admin/allocation-report/${shiftId}/generate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/allocation-report", selectedShift] });
      toast({
        title: "Report Generated",
        description: "Staff allocation report ready for manual contact",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate allocation report",
        variant: "destructive",
      });
    },
  });

  const updateResponseMutation = useMutation({
    mutationFn: async ({ shiftId, staffId, status, notes }: {
      shiftId: string;
      staffId: string;
      status: string;
      notes: string;
    }) => {
      return apiRequest(`/api/admin/allocation-response`, 'POST', { shiftId, staffId, status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/allocation-report", selectedShift] });
      setContactingStaffId("");
      setContactNotes("");
      toast({
        title: "Response Updated",
        description: "Staff response has been recorded",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update response",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'declined': return 'destructive';
      case 'pending': return 'outline';
      case 'no_response': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'no_response': return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manual Shift Allocation</h1>
          <p className="text-muted-foreground">
            Generate staff allocation reports and manually track responses
          </p>
        </div>
      </div>

      {/* Shift Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Shift for Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="shift-select">Open Shifts</Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shift to allocate staff" />
                </SelectTrigger>
                <SelectContent>
                  {openShifts?.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.role?.replace('_', ' ') || 'Unknown Role'} - {shift.careHomeName} - {shift.date ? format(new Date(shift.date), 'MMM d, yyyy') : 'No Date'} {shift.startTime}-{shift.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => selectedShift && generateReportMutation.mutate(selectedShift)}
              disabled={!selectedShift || generateReportMutation.isPending}
            >
              {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Report */}
      {allocationReport && (
        <div className="space-y-6">
          {/* Shift Details */}
          <Card>
            <CardHeader>
              <CardTitle>Shift Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <p className="font-medium">{allocationReport.shiftDetails.role.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {format(new Date(allocationReport.shiftDetails.date), 'MMM d, yyyy')}
                    <br />
                    {allocationReport.shiftDetails.startTime}-{allocationReport.shiftDetails.endTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Care Home</Label>
                  <p className="font-medium">{allocationReport.shiftDetails.careHomeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rate</Label>
                  <p className="font-medium">£{allocationReport.shiftDetails.hourlyRate}/hour</p>
                </div>
              </div>
              {allocationReport.shiftDetails.requiredSkills?.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Required Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allocationReport.shiftDetails.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Staff Allocation Candidates</span>
                <Badge variant="outline">
                  {allocationReport.candidates.length} candidates found
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocationReport.candidates.map((candidate, index) => (
                  <div key={`${candidate.staffId}-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <Badge variant="outline">{candidate.role.replace('_', ' ')}</Badge>
                          <Badge variant="default">
                            Score: {candidate.matchScore}%
                          </Badge>
                          {candidate.responseStatus && (
                            <div className="flex items-center gap-1">
                              {getStatusIcon(candidate.responseStatus)}
                              <Badge variant={getStatusColor(candidate.responseStatus)}>
                                {candidate.responseStatus.replace('_', ' ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Phone</Label>
                            <p className="text-sm font-medium">{candidate.phone}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Experience</Label>
                            <p className="text-sm">{candidate.experience} years</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Rate</Label>
                            <p className="text-sm">£{candidate.hourlyRate}/hour</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <Label className="text-xs text-muted-foreground">Match Reasons</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {candidate.matchReasons.map((reason, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {candidate.contactNotes && (
                          <div className="bg-muted p-2 rounded text-sm">
                            <Label className="text-xs text-muted-foreground">Contact Notes</Label>
                            <p>{candidate.contactNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${candidate.phone}`, '_self')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const message = `Hi ${candidate.firstName}, JoyJoy Care has a ${allocationReport.shiftDetails.role.replace('_', ' ')} shift available at ${allocationReport.shiftDetails.careHomeName} on ${format(new Date(allocationReport.shiftDetails.date), 'MMM d')} from ${allocationReport.shiftDetails.startTime}-${allocationReport.shiftDetails.endTime}. Rate: £${allocationReport.shiftDetails.hourlyRate}/hour. Are you available?`;
                            window.open(`sms:${candidate.phone}?body=${encodeURIComponent(message)}`, '_self');
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setContactingStaffId(candidate.staffId)}
                          disabled={contactingStaffId === candidate.staffId}
                        >
                          Update Response
                        </Button>
                      </div>
                    </div>

                    {/* Response Update Form */}
                    {contactingStaffId === candidate.staffId && (
                      <div className="mt-4 p-4 border-t bg-muted/50">
                        <h4 className="font-medium mb-3">Update Staff Response</h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="response-status">Response Status</Label>
                            <Select onValueChange={(value) => setContactingStaffId(value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select response status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="declined">Declined</SelectItem>
                                <SelectItem value="pending">Still Pending</SelectItem>
                                <SelectItem value="no_response">No Response</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="contact-notes">Contact Notes</Label>
                            <Textarea
                              id="contact-notes"
                              value={contactNotes}
                              onChange={(e) => setContactNotes(e.target.value)}
                              placeholder="Notes about the contact attempt and response..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                updateResponseMutation.mutate({
                                  shiftId: selectedShift,
                                  staffId: candidate.staffId,
                                  status: contactingStaffId,
                                  notes: contactNotes
                                });
                              }}
                              disabled={updateResponseMutation.isPending}
                            >
                              {updateResponseMutation.isPending ? 'Saving...' : 'Save Response'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setContactingStaffId("");
                                setContactNotes("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}