import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Upload, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

interface Document {
  id: string;
  title: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  expiryDate?: string;
  category: 'mandatory' | 'supplementary';
}

import { MEDICAL_DOCUMENT_REQUIREMENTS, ROLE_SPECIFIC_REQUIREMENTS, DOCUMENT_CATEGORIES } from '@/config/medical-compliance-requirements';

export default function DocumentComplianceTracker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);
  const [replacingDocument, setReplacingDocument] = useState<string | null>(null);

  // Fetch user's documents
  const { data: documents = [], isLoading, refetch } = useQuery<Document[]>({
    queryKey: [`/api/documents/staff/${user?.id}`],
    enabled: !!user?.id
  });

  // Load user documents for compliance tracking

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
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
        await refetch();
      }
    } catch (error) {
      console.error('Upload error:', error);
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
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
        await refetch();
      }
    } catch (error) {
      console.error('Replace error:', error);
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
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
        await refetch();
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingDocument(null);
    }
  };

  const DocumentRow = ({ requirement, category }: { requirement: any, category: 'mandatory' | 'supplementary' }) => {
    const statusInfo = getDocumentStatus(requirement.type);
    const StatusIcon = statusInfo.icon;

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex items-center space-x-4">
          <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{requirement.title}</h4>
              {category === 'mandatory' && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{requirement.description}</p>
            {statusInfo.doc && (
              <div className="text-xs text-blue-600 mt-1">
                📄 {statusInfo.doc.filename.split('-').slice(2).join('-').replace(/^\w+_/, '')}
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
            {statusInfo.status === 'missing' ? 'Not Uploaded' : statusInfo.status}
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
                      handleFileReplace(file, requirement.type, requirement.title);
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
                    handleFileUpload(file, requirement.type, requirement.title);
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
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mandatory Document Compliance</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(mandatoryProgress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Required Documents Progress</span>
              <span>{uploadedMandatory.length} of {mandatoryDocuments.length} completed</span>
            </div>
            <Progress value={mandatoryProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              Mandatory Documents
              <Badge variant="destructive" className="ml-2">Required</Badge>
            </span>
            <span className="text-sm text-gray-500">
              {uploadedMandatory.length} of {mandatoryDocuments.length} complete
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {mandatoryDocuments.map((requirement) => (
              <DocumentRow 
                key={requirement.type} 
                requirement={requirement} 
                category="mandatory" 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplementary Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              Supplementary Documents
              <Badge variant="secondary" className="ml-2">Optional</Badge>
            </span>
            <span className="text-sm text-gray-500">
              {uploadedSupplementary.length} of {supplementaryDocuments.length} complete
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {supplementaryDocuments.map((requirement) => (
              <DocumentRow 
                key={requirement.type} 
                requirement={requirement} 
                category="supplementary" 
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}