import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Upload, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { MEDICAL_DOCUMENT_REQUIREMENTS, DOCUMENT_CATEGORIES } from '@/config/medical-compliance-requirements';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  expiryDate?: string;
  category: 'mandatory' | 'supplementary';
  storagePath: string;
  filename: string;
}

export default function MedicalComplianceTracker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);
  const [replacingDocument, setReplacingDocument] = useState<string | null>(null);

  // Fetch user's documents
  const { data: documents = [], isLoading, refetch } = useQuery<Document[]>({
    queryKey: [`/api/documents/staff/${user?.id}`],
    enabled: !!user?.id
  });

  // Calculate completion percentage using medical requirements
  const mandatoryDocuments = MEDICAL_DOCUMENT_REQUIREMENTS.mandatory;
  const supplementaryDocuments = MEDICAL_DOCUMENT_REQUIREMENTS.supplementary;
  
  const uploadedMandatory = mandatoryDocuments.filter(req => 
    documents.some((doc: Document) => doc.documentType === req.type && doc.status === 'approved')
  );
  
  const uploadedSupplementary = supplementaryDocuments.filter(req => 
    documents.some((doc: Document) => doc.documentType === req.type && doc.status === 'approved')
  );

  const mandatoryProgress = (uploadedMandatory.length / mandatoryDocuments.length) * 100;

  // Group documents by category
  const documentsByCategory = mandatoryDocuments.reduce((acc, req) => {
    const category = req.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(req);
    return acc;
  }, {} as Record<string, typeof mandatoryDocuments>);

  const getDocumentStatus = (documentType: string) => {
    const doc = documents.find((d: Document) => d.documentType === documentType);
    if (!doc) return { status: 'missing', icon: XCircle, color: 'text-red-500' };
    
    switch (doc.status) {
      case 'approved':
        return { status: 'approved', icon: CheckCircle, color: 'text-green-500', doc };
      case 'pending':
        return { status: 'pending', icon: Clock, color: 'text-yellow-500', doc };
      case 'rejected':
        return { status: 'rejected', icon: XCircle, color: 'text-red-500', doc };
      default:
        return { status: 'missing', icon: XCircle, color: 'text-red-500' };
    }
  };

  const handleFileUpload = async (file: File, documentType: string, title: string) => {
    // Check if document of this type already exists
    const existingDoc = documents.find((doc: Document) => doc.documentType === documentType);
    if (existingDoc) {
      if (!confirm('A document of this type already exists. Do you want to replace it?')) {
        return;
      }
      // Use replace function instead
      handleFileReplace(file, documentType, title);
      return;
    }

    setUploadingDocument(documentType);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', 'staff');
      formData.append('entityId', user?.id || '');
      formData.append('documentType', documentType);
      formData.append('title', title);

      const response = await apiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Document uploaded successfully",
          description: "Your document has been uploaded and is pending review.",
        });
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
        await refetch();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleFileReplace = async (file: File, documentType: string, title: string) => {
    if (!user?.id) return;

    setReplacingDocument(documentType);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const response = await apiRequest(`/api/documents/staff/${user.id}/${documentType}`, {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Document replaced successfully",
          description: "Your document has been updated and is pending review.",
        });
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
        await refetch();
      }
    } catch (error) {
      console.error('Replace error:', error);
      toast({
        title: "Replace failed",
        description: "There was an error replacing your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReplacingDocument(null);
    }
  };

  const handleDocumentDelete = async (documentType: string) => {
    if (!user?.id) return;
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingDocument(documentType);
    try {
      const response = await apiRequest(`/api/documents/staff/${user.id}/${documentType}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Document deleted",
          description: "Your document has been successfully deleted.",
        });
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
        await refetch();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingDocument(null);
    }
  };

  const MedicalDocumentRow = ({ requirement, category }: { requirement: any, category: 'mandatory' | 'supplementary' }) => {
    const statusInfo = getDocumentStatus(requirement.type);
    const StatusIcon = statusInfo.icon;

    // Check if document is expiring soon
    const isExpiringSoon = statusInfo.doc?.expiryDate && 
      new Date(statusInfo.doc.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            {isExpiringSoon && (
              <AlertTriangle className="h-4 w-4 text-amber-500" title="Expiring soon" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="text-lg">{requirement.icon}</span>
                {requirement.label}
              </h4>
              {category === 'mandatory' && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
              {isExpiringSoon && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  Expiring Soon
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{requirement.description}</p>
            {statusInfo.doc && (
              <div className="text-xs text-blue-600 mt-1 flex items-center gap-2">
                📄 {statusInfo.doc.filename?.split('-').slice(2).join('-').replace(/^\w+_/, '') || 'Document'}
                {statusInfo.doc.expiryDate && (
                  <span className="text-gray-500">
                    • Expires: {new Date(statusInfo.doc.expiryDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge 
            variant={
              statusInfo.status === 'approved' ? 'default' : 
              statusInfo.status === 'pending' ? 'secondary' : 
              'destructive'
            }
            className="text-xs"
          >
            {statusInfo.status === 'missing' ? 'Not Uploaded' : 
             statusInfo.status === 'approved' ? 'Verified' : 
             statusInfo.status}
          </Badge>

          {statusInfo.doc ? (
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  // Parse the storage path to extract entityType and bucket path
                  const parts = statusInfo.doc.storagePath.split('/');
                  const entityType = parts[0]; // 'staff'
                  const bucketPath = parts.slice(1).join('/'); // 'entityId/filename'
                  window.open(`/api/documents/view/${entityType}/${bucketPath}`, '_blank');
                }}
                title="View Document"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  id={`replace-${requirement.type}`}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileReplace(file, requirement.type, requirement.label);
                    }
                  }}
                  disabled={replacingDocument === requirement.type}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0"
                  disabled={replacingDocument === requirement.type}
                  title="Replace Document"
                >
                  {replacingDocument === requirement.type ? (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <Edit className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                onClick={() => handleDocumentDelete(requirement.type)}
                disabled={deletingDocument === requirement.type}
                title="Delete Document"
              >
                {deletingDocument === requirement.type ? (
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                id={`upload-${requirement.type}`}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, requirement.type, requirement.label);
                  }
                }}
                disabled={uploadingDocument === requirement.type}
              />
              <Button 
                size="sm" 
                variant="outline"
                disabled={uploadingDocument === requirement.type}
                className="h-8"
              >
                <Upload className="h-4 w-4 mr-1" />
                {uploadingDocument === requirement.type ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Medical Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-medical-blue" />
            Medical Professional Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{uploadedMandatory.length}</div>
                <div className="text-sm text-blue-600">of {mandatoryDocuments.length} mandatory</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{Math.round(mandatoryProgress)}%</div>
                <div className="text-sm text-green-600">compliance rate</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{uploadedSupplementary.length}</div>
                <div className="text-sm text-purple-600">supplementary docs</div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Mandatory Medical Documents</span>
                <span className="text-sm text-gray-500">
                  {uploadedMandatory.length} of {mandatoryDocuments.length} completed
                </span>
              </div>
              <Progress value={mandatoryProgress} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Compliance Documents by Category */}
      {Object.entries(documentsByCategory).map(([categoryName, categoryDocs]) => {
        const categoryInfo = DOCUMENT_CATEGORIES[categoryName] || {
          icon: '📄',
          color: 'bg-gray-50 text-gray-700 border-gray-200'
        };
        
        const completedInCategory = categoryDocs.filter(req => 
          documents.some((doc: Document) => doc.documentType === req.type && doc.status === 'approved')
        ).length;

        return (
          <Card key={categoryName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                  <span className="text-lg">{categoryInfo.icon}</span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-medical-blue">{categoryName}</div>
                  <div className="text-sm text-gray-500">
                    {completedInCategory} of {categoryDocs.length} documents completed
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {categoryDocs.map((requirement) => (
                  <MedicalDocumentRow 
                    key={requirement.type}
                    requirement={requirement}
                    category="mandatory"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Supplementary Documents */}
      {supplementaryDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border-indigo-200">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <div className="text-lg font-semibold text-medical-blue">Additional Qualifications</div>
                <div className="text-sm text-gray-500">
                  Optional documents to enhance your profile
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {supplementaryDocuments.map((requirement) => (
                <MedicalDocumentRow 
                  key={requirement.type}
                  requirement={requirement}
                  category="supplementary"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}