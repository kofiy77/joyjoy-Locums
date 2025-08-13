import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Upload, FileText, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DocumentRequirement {
  id: string;
  documentType: string;
  isRequired: boolean;
  isSubmitted: boolean;
  documentUrl: string | null;
  submittedAt: string | null;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes: string | null;
}

interface OnboardingStatus {
  userProfileId: string;
  currentStep: string;
  documentsComplete: boolean;
  adminNotes: string | null;
  registrationStatus: string;
  documentRequirements: DocumentRequirement[];
}

const documentTypeLabels = {
  id_document: "Photo ID (Passport/Driving License)",
  right_to_work: "Right to Work Documentation",
  dbs_check: "DBS Check Certificate"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800", 
  rejected: "bg-red-100 text-red-800"
};

export default function StaffOnboardingPortal() {
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File}>({});
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: onboardingStatus, isLoading } = useQuery<OnboardingStatus>({
    queryKey: ["/api/staff/onboarding/status"],
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ documentType, file }: { documentType: string; file: File }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      
      const response = await fetch('/api/staff/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and is awaiting review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/onboarding/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (documentType: string, file: File) => {
    setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
  };

  const handleUpload = async (documentType: string) => {
    const file = selectedFiles[documentType];
    if (!file) return;

    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    
    try {
      await uploadMutation.mutateAsync({ documentType, file });
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[documentType];
        return newFiles;
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[documentType];
        return newProgress;
      });
    } catch (error) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[documentType];
        return newProgress;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your onboarding status...</p>
        </div>
      </div>
    );
  }

  if (!onboardingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load your onboarding status. Please contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const completedDocs = onboardingStatus.documentRequirements.filter(doc => doc.isSubmitted).length;
  const totalDocs = onboardingStatus.documentRequirements.length;
  const progressPercentage = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;

  const getStatusMessage = () => {
    switch (onboardingStatus.registrationStatus) {
      case 'pending_documents':
        return "Please upload all required documents to continue with your registration.";
      case 'documents_submitted':
        return "All documents submitted! Our team is reviewing your application.";
      case 'under_review':
        return "Your documents are currently being reviewed by our admin team.";
      case 'approved':
        return "Congratulations! Your application has been approved. You now have full access to the platform.";
      case 'rejected':
        return "Your application requires attention. Please see the notes below and re-submit required documents.";
      default:
        return "Welcome to your onboarding portal.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Onboarding Portal</h1>
          <p className="text-gray-600">Complete your document verification to gain full platform access</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Onboarding Progress
            </CardTitle>
            <CardDescription>{getStatusMessage()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span>Documents Uploaded</span>
                  <span>{completedDocs}/{totalDocs}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              
              <Badge 
                variant="outline" 
                className={`${
                  onboardingStatus.registrationStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                  onboardingStatus.registrationStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                  onboardingStatus.registrationStatus === 'under_review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}
              >
                {onboardingStatus.registrationStatus.replace('_', ' ').toUpperCase()}
              </Badge>

              {onboardingStatus.adminNotes && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Admin Notes:</strong> {onboardingStatus.adminNotes}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Section */}
        <div className="grid gap-6">
          <h2 className="text-xl font-semibold text-gray-900">Required Documents</h2>
          
          {onboardingStatus.documentRequirements.map((requirement) => (
            <Card key={requirement.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {documentTypeLabels[requirement.documentType as keyof typeof documentTypeLabels]}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {requirement.isSubmitted && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <Badge className={statusColors[requirement.verificationStatus]}>
                      {requirement.verificationStatus}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {requirement.documentType === 'id_document' && "Upload a clear photo of your passport or driving license"}
                  {requirement.documentType === 'right_to_work' && "Provide documentation proving your right to work in the UK"}
                  {requirement.documentType === 'dbs_check' && "Upload your current DBS check certificate"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {requirement.isSubmitted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      Submitted on {new Date(requirement.submittedAt!).toLocaleDateString()}
                    </div>
                    
                    {requirement.verificationStatus === 'rejected' && requirement.verificationNotes && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Rejected:</strong> {requirement.verificationNotes}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {requirement.verificationStatus === 'rejected' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id={`file-${requirement.documentType}`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(requirement.documentType, file);
                          }}
                        />
                        <label htmlFor={`file-${requirement.documentType}`} className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Re-upload Document</p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                        </label>
                        
                        {selectedFiles[requirement.documentType] && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">
                              Selected: {selectedFiles[requirement.documentType].name}
                            </p>
                            <Button 
                              onClick={() => handleUpload(requirement.documentType)}
                              disabled={uploadMutation.isPending}
                            >
                              {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id={`file-${requirement.documentType}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(requirement.documentType, file);
                      }}
                    />
                    <label htmlFor={`file-${requirement.documentType}`} className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900">Upload Document</p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                    </label>
                    
                    {selectedFiles[requirement.documentType] && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Selected: {selectedFiles[requirement.documentType].name}
                        </p>
                        <Button 
                          onClick={() => handleUpload(requirement.documentType)}
                          disabled={uploadMutation.isPending}
                        >
                          {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                        </Button>
                      </div>
                    )}
                    
                    {uploadProgress[requirement.documentType] !== undefined && (
                      <div className="mt-4">
                        <Progress value={uploadProgress[requirement.documentType]} className="h-2" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        {onboardingStatus.registrationStatus === 'documents_submitted' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Our admin team will review all your documents within 24-48 hours</p>
                <p>• You'll receive an email notification once the review is complete</p>
                <p>• If approved, you'll gain full access to browse and accept shifts</p>
                <p>• If any documents need attention, we'll provide specific feedback</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}