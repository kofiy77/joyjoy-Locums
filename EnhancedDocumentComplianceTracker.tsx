import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Upload, Eye, Edit, Trash2, FileText, AlertTriangle, Calendar, Shield } from 'lucide-react';
import { format, isAfter, isBefore, addMonths } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import ComplianceUploadDialog, { COMPLIANCE_DOCUMENT_TYPES } from './ComplianceUploadDialog';

interface Document {
  id: string;
  documentType: string;
  title: string;
  filename: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  category: 'mandatory' | 'supplementary';
}

export default function EnhancedDocumentComplianceTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<keyof typeof COMPLIANCE_DOCUMENT_TYPES | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  // Fetch user's documents
  const { data: documents = [], isLoading, refetch } = useQuery<Document[]>({
    queryKey: [`/api/documents/staff/${user?.id}`],
    enabled: !!user?.id
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentType: string) => {
      const response = await apiRequest(`/api/documents/staff/${user?.id}/${documentType}`, {
        method: 'DELETE'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "Document has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
      setDeletingDocument(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document.",
        variant: "destructive"
      });
    }
  });

  // Calculate completion statistics
  const mandatoryTypes = Object.entries(COMPLIANCE_DOCUMENT_TYPES).filter(([_, config]) => config.mandatory);
  const supplementaryTypes = Object.entries(COMPLIANCE_DOCUMENT_TYPES).filter(([_, config]) => !config.mandatory);

  const uploadedMandatory = mandatoryTypes.filter(([type]) => 
    documents.some(doc => doc.documentType === type && doc.status === 'approved')
  );
  
  const uploadedSupplementary = supplementaryTypes.filter(([type]) => 
    documents.some(doc => doc.documentType === type && doc.status === 'approved')
  );

  const mandatoryProgress = mandatoryTypes.length > 0 ? (uploadedMandatory.length / mandatoryTypes.length) * 100 : 0;
  const overallProgress = (uploadedMandatory.length + uploadedSupplementary.length) / Object.keys(COMPLIANCE_DOCUMENT_TYPES).length * 100;

  // Get document status and metadata
  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find(d => d.documentType === documentType);
    const config = COMPLIANCE_DOCUMENT_TYPES[documentType as keyof typeof COMPLIANCE_DOCUMENT_TYPES];
    
    if (!doc) {
      return {
        status: 'missing',
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        doc: null,
        isExpiring: false,
        isExpired: false
      };
    }

    // Check expiry status
    const isExpiring = doc.expiryDate ? isBefore(new Date(doc.expiryDate), addMonths(new Date(), 3)) : false;
    const isExpired = doc.expiryDate ? isBefore(new Date(doc.expiryDate), new Date()) : false;

    switch (doc.status) {
      case 'approved':
        return {
          status: 'approved',
          icon: CheckCircle,
          color: isExpired ? 'text-red-500' : isExpiring ? 'text-orange-500' : 'text-green-500',
          bgColor: isExpired ? 'bg-red-50' : isExpiring ? 'bg-orange-50' : 'bg-green-50',
          borderColor: isExpired ? 'border-red-200' : isExpiring ? 'border-orange-200' : 'border-green-200',
          doc,
          isExpiring,
          isExpired
        };
      case 'pending':
        return {
          status: 'pending',
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          doc,
          isExpiring: false,
          isExpired: false
        };
      case 'rejected':
        return {
          status: 'rejected',
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          doc,
          isExpiring: false,
          isExpired: false
        };
      default:
        return {
          status: 'missing',
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          doc: null,
          isExpiring: false,
          isExpired: false
        };
    }
  };

  const handleUploadClick = (documentType: keyof typeof COMPLIANCE_DOCUMENT_TYPES) => {
    console.log('🔴 Upload clicked for document type:', documentType);
    setSelectedDocumentType(documentType);
  };

  const handleCloseUpload = () => {
    setSelectedDocumentType(null);
    setUploadingDocument(null);
  };

  const handleUploadComplete = () => {
    refetch();
    handleCloseUpload();
  };

  const handleViewDocument = async (documentType: string) => {
    if (!user?.id) return;

    try {
      console.log(`📄 Looking for document type: ${documentType}`);
      console.log(`📄 Available documents:`, documents?.map(d => ({ 
        filename: d.filename, 
        documentType: d.documentType,
        id: d.id 
      })));

      // Find document using the documentType field that the backend properly extracts
      const doc = documents?.find((d: any) => {
        console.log(`📄 Checking document: ${d.filename}, documentType: ${d.documentType}`);
        return d.documentType === documentType;
      });

      if (!doc) {
        console.error(`📄 Document not found for type: ${documentType}`);
        toast({
          title: "Document Not Found",
          description: `No ${documentType.replace('_', ' ')} document found. Please upload this document first.`,
          variant: "destructive"
        });
        return;
      }

      console.log(`📄 Found document: ${doc.filename}`);

      // Fetch document with authentication token
      const token = localStorage.getItem('auth_token');
      const viewUrl = `/api/documents/view/staff/${user.id}/${documentType}`;
      console.log(`📄 Fetching authenticated document: ${viewUrl}`);
      
      const response = await fetch(viewUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Create blob and object URL
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(blobUrl, '_blank');
      
      // Check if popup was blocked
      if (!newWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site to view documents.",
          variant: "destructive"
        });
      } else {
        // Clean up blob URL after a delay to prevent memory leaks
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Document view error:', error);
      toast({
        title: "View Failed",
        description: "Could not open document for viewing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDocument = (documentType: string) => {
    setDeletingDocument(documentType);
  };

  const confirmDelete = () => {
    if (deletingDocument) {
      deleteMutation.mutate(deletingDocument);
    }
  };

  const renderDetailedDocumentCard = (documentType: string, config: any) => {
    const statusInfo = getDocumentStatus(documentType);
    const { status, icon: Icon, color, bgColor, borderColor, doc, isExpiring, isExpired } = statusInfo;
    
    // Create formatted date range for display
    const getDateRange = () => {
      if (!doc) return null;
      if (doc.issueDate && doc.expiryDate) {
        const issueFormatted = format(new Date(doc.issueDate), 'do MMM yyyy');
        const expiryFormatted = format(new Date(doc.expiryDate), 'do MMM yyyy');
        return `${issueFormatted} - ${expiryFormatted}`;
      } else if (doc.expiryDate) {
        return `Expires: ${format(new Date(doc.expiryDate), 'do MMM yyyy')}`;
      } else if (doc.issueDate) {
        return `Issued: ${format(new Date(doc.issueDate), 'do MMM yyyy')}`;
      }
      return null;
    };

    // Get status text matching the reference image
    const getStatusText = () => {
      if (!doc) return 'Evidence Not Provided';
      if (isExpired) return 'Expired';
      if (status === 'approved') return 'Uploaded';
      if (status === 'pending') return 'Pending Review';
      if (status === 'rejected') return 'Rejected';
      return 'Unknown';
    };

    // Get status color classes
    const getStatusColor = () => {
      if (!doc) return 'text-red-600';
      if (isExpired) return 'text-red-600';
      if (status === 'approved') return 'text-green-600';
      if (status === 'pending') return 'text-blue-600';
      if (status === 'rejected') return 'text-red-600';
      return 'text-gray-600';
    };

    return (
      <div key={documentType} className={`
        border rounded-lg transition-all duration-200 hover:shadow-md
        ${config.mandatory && !doc ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}
        ${config.mandatory && doc && status === 'pending' ? 'bg-yellow-50 border-yellow-200' : ''}
        ${config.mandatory && doc && status === 'approved' && !isExpired && !isExpiring ? 'bg-green-50 border-green-200' : ''}
        ${config.mandatory && doc && status === 'approved' && isExpiring && !isExpired ? 'bg-orange-50 border-orange-200' : ''}
        ${config.mandatory && doc && status === 'approved' && isExpired ? 'bg-red-50 border-red-200' : ''}
        ${config.mandatory && doc && status === 'rejected' ? 'bg-red-50 border-red-200' : ''}
      `}>
        <div className="p-4">
          {/* Status Badge at Top - Only for mandatory documents */}
          {config.mandatory && (
            <div className={`
              mb-4 px-3 py-2 rounded-lg text-center text-sm font-semibold inline-block w-full
              ${!doc ? 'bg-red-100 text-red-800' : ''}
              ${doc && status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${doc && status === 'approved' && !isExpired && !isExpiring ? 'bg-green-100 text-green-800' : ''}
              ${doc && status === 'approved' && isExpiring && !isExpired ? 'bg-orange-100 text-orange-800' : ''}
              ${doc && status === 'approved' && isExpired ? 'bg-red-100 text-red-800' : ''}
              ${doc && status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
            `}>
              {!doc && 'REQUIRED - NOT UPLOADED'}
              {doc && status === 'pending' && 'PENDING REVIEW'}
              {doc && status === 'approved' && !isExpired && !isExpiring && 'VERIFIED ✓'}
              {doc && status === 'approved' && isExpiring && !isExpired && 'VERIFIED - EXPIRES SOON'}
              {doc && status === 'approved' && isExpired && 'EXPIRED - RENEWAL REQUIRED'}
              {doc && status === 'rejected' && 'REJECTED - RESUBMIT REQUIRED'}
            </div>
          )}

          {/* Header with icon and title */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="h-6 w-6" />
                {/* Warning triangle overlay for expiring/expired */}
                {(isExpiring || isExpired) && (
                  <div className="absolute -mt-8 -mr-8">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-2.5 w-2.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{config.label}</h3>
                
                {/* Date Range */}
                {getDateRange() && (
                  <p className="text-xs text-gray-500 mb-1">{getDateRange()}</p>
                )}
                
                {/* Required by information */}
                <div className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">Required by:</span> JoyJoy Care, UK Healthcare Regulations
                  {config.mandatory && (
                    <Badge variant="destructive" className="text-xs ml-2">Mandatory</Badge>
                  )}
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Status:</span>
                  <span className={`text-xs font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                  
                  {/* Expiry warning */}
                  {isExpiring && !isExpired && (
                    <span className="text-xs text-orange-600 font-medium">
                      • Document expires within 3 months
                    </span>
                  )}
                  
                  {isExpired && (
                    <span className="text-xs text-red-600 font-medium">
                      • Document has expired
                    </span>
                  )}
                </div>

                {/* Additional document details for uploaded docs */}
                {doc && doc.status === 'approved' && (
                  <div className="mt-2 space-y-1">
                    {/* Document filename */}
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">File:</span> {doc.filename}
                    </div>
                    
                    {/* Certificate/Document number (simulated) */}
                    {documentType === 'dbs_certificate' && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">DBS Certificate Number:</span> 001796629651
                      </div>
                    )}
                    
                    {/* Upload date */}
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Uploaded:</span> {format(new Date(doc.uploadedAt), 'do MMM yyyy')}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUploadClick(documentType as keyof typeof COMPLIANCE_DOCUMENT_TYPES)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {doc ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDocument(documentType)}
                  className="flex-1 h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Document
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDocument(documentType)}
                  className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => handleUploadClick(documentType as keyof typeof COMPLIANCE_DOCUMENT_TYPES)}
                className="w-full h-8 text-xs"
                disabled={uploadingDocument === documentType}
              >
                <Upload className="h-3 w-3 mr-1" />
                {uploadingDocument === documentType ? 'Uploading...' : 'Upload Document'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Compliance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Loading compliance status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{uploadedMandatory.length}</div>
              <div className="text-sm text-gray-600">of {mandatoryTypes.length} mandatory documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{uploadedSupplementary.length}</div>
              <div className="text-sm text-gray-600">supplementary documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-gray-600">overall completion</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mandatory Documents Progress</span>
              <span>{Math.round(mandatoryProgress)}%</span>
            </div>
            <Progress value={mandatoryProgress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mandatory Compliance Documents</CardTitle>
          <p className="text-sm text-gray-600">
            These documents are required before you can be assigned to shifts.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mandatoryTypes.map(([type, config]) => renderDetailedDocumentCard(type, config))}
          </div>
        </CardContent>
      </Card>

      {/* Supplementary Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supplementary Documents</CardTitle>
          <p className="text-sm text-gray-600">
            These documents are optional but may help you qualify for specialized shifts.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplementaryTypes.map(([type, config]) => renderDetailedDocumentCard(type, config))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      {selectedDocumentType && (
        <ComplianceUploadDialog
          isOpen={!!selectedDocumentType}
          onClose={handleCloseUpload}
          documentType={selectedDocumentType}
          existingDocument={documents.find(doc => doc.documentType === selectedDocumentType) || null}
          onUploadComplete={handleUploadComplete}
        />
      )}
      
      {/* Debug info */}
      {selectedDocumentType && (
        <div className="fixed top-4 right-4 bg-red-100 p-2 rounded text-xs z-50">
          Dialog should be open for: {selectedDocumentType}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingDocument} onOpenChange={() => setDeletingDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingDocument(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}