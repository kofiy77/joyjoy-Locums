import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Eye, FileText, User, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DocumentRequirement {
  id: string;
  documentType: string;
  isSubmitted: boolean;
  documentUrl: string | null;
  submittedAt: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes: string | null;
}

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationStatus: string;
  createdAt: string;
  staffOnboarding: any[];
  documentRequirements: DocumentRequirement[];
}

const documentTypeLabels = {
  id_document: "Photo ID",
  right_to_work: "Right to Work",
  dbs_check: "DBS Check"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800"
};

export default function AdminOnboardingReview() {
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [documentReviews, setDocumentReviews] = useState<{[key: string]: {status: string, notes: string}}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers, isLoading } = useQuery<PendingUser[]>({
    queryKey: ["/api/admin/onboarding/pending"],
    retry: false,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: 'approve' | 'reject' }) => {
      return await apiRequest(`/api/admin/onboarding/review/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminNotes: reviewNotes,
          documentReviews: Object.entries(documentReviews).map(([docId, review]) => ({
            documentId: docId,
            status: review.status,
            notes: review.notes
          }))
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Review completed",
        description: "Staff application has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/onboarding/pending"] });
      setSelectedUser(null);
      setReviewNotes("");
      setDocumentReviews({});
    },
    onError: (error: any) => {
      toast({
        title: "Review failed",
        description: error.message || "Failed to process staff application.",
        variant: "destructive",
      });
    },
  });

  const handleDocumentReview = (docId: string, status: string, notes: string) => {
    setDocumentReviews(prev => ({
      ...prev,
      [docId]: { status, notes }
    }));
  };

  const handleApprove = () => {
    if (!selectedUser) return;
    
    // Ensure all documents are marked as approved
    const allDocumentsReviewed = selectedUser.documentRequirements.every(doc => 
      documentReviews[doc.id]?.status === 'approved'
    );

    if (!allDocumentsReviewed) {
      toast({
        title: "Review incomplete",
        description: "Please approve all documents before approving the application.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({ userId: selectedUser.id, action: 'approve' });
  };

  const handleReject = () => {
    if (!selectedUser) return;
    
    if (!reviewNotes.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide notes explaining why the application is being rejected.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({ userId: selectedUser.id, action: 'reject' });
  };

  const viewDocument = async (documentId: string) => {
    try {
      const response = await apiRequest(`/api/admin/documents/view/${documentId}`);
      if (response.documentUrl) {
        window.open(response.documentUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Document access failed",
        description: error.message || "Unable to open document.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Onboarding Review</h1>
          <p className="text-gray-600">Review and approve new staff applications</p>
        </div>

        {/* Pending Applications List */}
        <div className="grid gap-6">
          {!pendingUsers || pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                <p className="text-gray-600">All staff onboarding applications have been reviewed.</p>
              </CardContent>
            </Card>
          ) : (
            pendingUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-blue-500" />
                      <div>
                        <CardTitle className="text-xl">
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${
                      user.registrationStatus === 'documents_submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {user.registrationStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Application Details */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Applied on {new Date(user.createdAt).toLocaleDateString()}
                    </div>

                    {/* Document Status Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      {user.documentRequirements.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className={`w-2 h-2 rounded-full ${
                            doc.verificationStatus === 'approved' ? 'bg-green-500' :
                            doc.verificationStatus === 'rejected' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          <span className="text-sm font-medium">
                            {documentTypeLabels[doc.documentType as keyof typeof documentTypeLabels]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Review Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => {
                            setSelectedUser(user);
                            setReviewNotes("");
                            setDocumentReviews({});
                          }}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review Application
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Review: {selectedUser?.firstName} {selectedUser?.lastName}
                          </DialogTitle>
                          <DialogDescription>
                            Review submitted documents and approve or reject the application
                          </DialogDescription>
                        </DialogHeader>

                        {selectedUser && (
                          <div className="space-y-6">
                            {/* Applicant Info */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Applicant Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                                <div><strong>Email:</strong> {selectedUser.email}</div>
                                <div><strong>Applied:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
                              </CardContent>
                            </Card>

                            {/* Document Review */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Document Review</h3>
                              
                              {selectedUser.documentRequirements.map((doc) => (
                                <Card key={doc.id}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">
                                        {documentTypeLabels[doc.documentType as keyof typeof documentTypeLabels]}
                                      </CardTitle>
                                      <Badge className={statusColors[doc.verificationStatus]}>
                                        {doc.verificationStatus}
                                      </Badge>
                                    </div>
                                  </CardHeader>
                                  
                                  <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => viewDocument(doc.id)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Document
                                      </Button>
                                      
                                      <Button
                                        variant={documentReviews[doc.id]?.status === 'approved' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleDocumentReview(doc.id, 'approved', '')}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      
                                      <Button
                                        variant={documentReviews[doc.id]?.status === 'rejected' ? 'destructive' : 'outline'}
                                        size="sm"
                                        onClick={() => handleDocumentReview(doc.id, 'rejected', '')}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </div>

                                    {documentReviews[doc.id]?.status === 'rejected' && (
                                      <Textarea
                                        placeholder="Explain why this document is rejected..."
                                        value={documentReviews[doc.id]?.notes || ''}
                                        onChange={(e) => handleDocumentReview(doc.id, 'rejected', e.target.value)}
                                      />
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            {/* Admin Notes */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Admin Notes</label>
                              <Textarea
                                placeholder="Add any notes about this application..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleApprove}
                                disabled={reviewMutation.isPending}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {reviewMutation.isPending ? "Processing..." : "Approve Application"}
                              </Button>
                              
                              <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={reviewMutation.isPending}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {reviewMutation.isPending ? "Processing..." : "Reject Application"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}