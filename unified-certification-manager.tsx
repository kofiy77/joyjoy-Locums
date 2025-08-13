import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, Download, CheckCircle, XCircle, Upload, Search, User, Phone, MapPin, MoreVertical, Eye, Edit, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SimpleDocumentUpload from './document-upload';

// Types
interface Certification {
  id: string;
  title: string;
  type: string;
  staffId: string;
  staffName?: string;
  staffEmail?: string;
  staffPhone?: string;
  staffPostcode?: string;
  fileName?: string;
  fileSize?: number;
  issueDate?: string;
  expiryDate?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isValid: boolean;
  createdAt: string;
  verifiedByFirstName?: string;
  verifiedByLastName?: string;
  verifiedAt?: string;
}

// Document type labels for better display including new medical compliance types
const documentTypeLabels: Record<string, string> = {
  'dbs_check': 'DBS Check',
  'dbs_enhanced_check': 'DBS Enhanced Check',
  'right_to_work': 'Right to Work',
  'medical_indemnity_insurance': 'Medical Indemnity Insurance',
  'discharge_medicine_service': 'Discharge Medicine Service (DMS)',
  'gmc_registration': 'GMC Registration',
  'nmc_registration': 'NMC Registration',
  'professional_qualification': 'Professional Qualification',
  'moving_handling': 'Moving & Handling',
  'safeguarding': 'Safeguarding',
  'first_aid': 'First Aid',
  'food_hygiene': 'Food Hygiene',
  'medication_administration': 'Medication Administration',
  'health_safety': 'Health & Safety',
  'fire_safety': 'Fire Safety',
  'infection_control': 'Infection Control'
};

// Status badge helper
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'verified':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

// Expiry status helper
const getExpiryStatus = (expiryDate?: string) => {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { label: 'Expired', color: 'red' };
  } else if (diffDays <= 30) {
    return { label: 'Expiring Soon', color: 'yellow' };
  } else {
    return { label: 'Valid', color: 'green' };
  }
};

// File size formatter
const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function UnifiedCertificationManager({ staffId }: { staffId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCertForEdit, setSelectedCertForEdit] = useState<any>(null);
  const [selectedCertForView, setSelectedCertForView] = useState<any>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  // Get user type from localStorage to determine admin status
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.type === 'admin' || user?.type === 'business_support';

  // Fetch only compliance records (unified endpoint that includes all certification types)
  const { data: complianceData = [], isLoading } = useQuery({
    queryKey: ['/api/compliance/records'],
  });

  // Use only the compliance data (no combining of multiple sources to avoid duplicates)
  const certifications = ((complianceData as any[]) || []).map((record: any) => ({
    id: record.id,
    title: record.title,
    type: record.type,
    staffId: record.staffId,
    staffName: record.staffFirstName && record.staffLastName 
      ? `${record.staffFirstName} ${record.staffLastName}`.trim()
      : 'Unknown Staff',
    fileName: record.fileName,
    fileSize: record.fileSize,
    issueDate: record.issueDate,
    expiryDate: record.expiryDate,
    verificationStatus: record.verificationStatus || 'pending',
    isValid: record.verificationStatus === 'verified',
    createdAt: record.createdAt,
    complianceCategory: record.complianceCategory,
    isRequired: record.isRequired,
    isMandatory: record.isMandatory,
    verifiedByFirstName: record.verifiedByFirstName,
    verifiedByLastName: record.verifiedByLastName,
    verifiedAt: record.verifiedAt
  }));

  // Approval mutation - handles both general compliance and DBS compliance
  const approvalMutation = useMutation({
    mutationFn: async ({ certId, status, notes, recordType }: { 
      certId: string; 
      status: 'verified' | 'rejected' | 'pending'; 
      notes?: string;
      recordType?: string;
    }) => {
      console.log('🔄 Mutation starting:', { certId, status, notes, recordType });
      
      let response;
      // All compliance records in this system use the general compliance endpoint
      // The DBS compliance endpoint is for separate DBS-specific records only
      console.log('🔄 Using general compliance endpoint for:', recordType);
      response = await apiRequest(`/api/compliance/records/${certId}`, {
        method: 'PUT',
        body: { 
          verificationStatus: status,
          notes: status === 'rejected' ? (notes || 'Document rejected by admin') : null
        },
      });
      
      // Parse JSON response
      const data = await response.json();
      console.log('✅ Mutation response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Mutation successful:', data);
      
      // Invalidate all compliance-related queries to ensure updates cascade
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dbs-compliance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard-stats'] });
      
      // Force immediate refetch to ensure UI updates
      queryClient.refetchQueries({ queryKey: ['/api/compliance/records'] });
      
      toast({
        title: "Success",
        description: data?.message || "Compliance document status updated successfully"
      });
    },
    onError: (error: any) => {
      console.error('❌ Approval mutation error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error status:', error?.status);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Extract meaningful error message
      let errorMessage = "Failed to update document status";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.statusText) {
        errorMessage = error.response.statusText;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleDownload = async (certId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/certifications/${certId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproval = (certId: string, status: 'verified' | 'rejected' | 'pending', notes?: string, recordType?: string) => {
    approvalMutation.mutate({ certId, status, notes, recordType });
  };

  // Quick view handler - uses certification ID for direct admin access
  const handleQuickView = async (cert: Certification) => {
    try {
      setSelectedCertForView(cert);
      
      // Check if document has a file
      if (!cert.fileName) {
        toast({
          title: "Document Not Found",
          description: `No ${cert.type.replace('_', ' ')} document found. Please upload this document first.`,
          variant: "destructive"
        });
        return;
      }

      console.log(`📄 Admin viewing document for certification ID: ${cert.id}`);

      // Use certification ID for direct admin access - this matches the existing working backend endpoint
      const token = localStorage.getItem('auth_token');
      const viewUrl = `/api/documents/view/${cert.id}`;
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

      // Create blob and object URL for secure document streaming
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

  // Edit details handler - opens status management dialog
  const handleEditDetails = (cert: Certification) => {
    setSelectedCertForEdit(cert);
    setEditStatus(cert.verificationStatus);
    setEditNotes('');
  };

  // Save status changes
  const handleSaveStatusChanges = async () => {
    if (!selectedCertForEdit) return;
    
    try {
      console.log('🔄 Saving status changes:', {
        certId: selectedCertForEdit.id,
        status: editStatus,
        notes: editNotes,
        recordType: selectedCertForEdit.type
      });
      
      await approvalMutation.mutateAsync({
        certId: selectedCertForEdit.id,
        status: editStatus as 'verified' | 'rejected' | 'pending',
        notes: editNotes,
        recordType: selectedCertForEdit.type
      });
      
      setSelectedCertForEdit(null);
      setEditStatus('');
      setEditNotes('');
      
      toast({
        title: "Success",
        description: "Compliance document status updated successfully",
      });
    } catch (error: any) {
      console.error('❌ Status update error:', error);
      console.error('❌ Error details:', error?.message, error?.response);
      toast({
        title: "Error",
        description: `Failed to update compliance document status: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  // Filter certifications based on search and status
  const filteredCertifications = certifications.filter((cert: Certification) => {
    const matchesSearch = searchTerm === '' || 
      cert.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.staffEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.verificationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group certifications by staff for the unified view
  const groupedCertifications = filteredCertifications.reduce((acc: Record<string, Certification[]>, cert: Certification) => {
    const staffName = cert.staffName || 'Unknown Staff';
    if (!acc[staffName]) {
      acc[staffName] = [];
    }
    acc[staffName].push(cert);
    return acc;
  }, {});

  // Define mandatory certification types
  const mandatoryItems = [
    { key: 'DBS', label: 'DBS Check', types: ['dbs_check', 'dbs check', 'enhanced dbs', 'standard dbs'] },
    { key: 'RTW', label: 'Right to Work', types: ['right_to_work', 'right to work', 'rtw', 'work permit'] },
    { key: 'ID', label: 'Photo ID', types: ['passport', 'driving licence', 'national id', 'photo_id'] },
    { key: 'Training', label: 'Mandatory Training', types: ['health_safety', 'fire_safety', 'moving_handling', 'mandatory_training'] },
    { key: 'References', label: 'Professional References', types: ['employment reference', 'character reference', 'professional_references'] }
  ];

  // Function to check compliance status for each staff member
  const getComplianceStatus = (staffCerts: Certification[]) => {
    const missing = [];
    const expiring = [];
    
    console.log('🔍 Checking compliance for staff certs:', staffCerts.map(c => ({ 
      title: c.title, 
      type: c.type, 
      verificationStatus: c.verificationStatus, 
      isValid: c.isValid 
    })));
    
    for (const item of mandatoryItems) {
      const hasValidCert = staffCerts.some(cert => {
        // Enhanced matching logic - check both cert.type and cert.title
        const certType = (cert.type || '').toLowerCase().trim();
        const certTitle = (cert.title || '').toLowerCase().trim();
        
        // Check if any of the mandatory types match the certification
        const typeMatches = item.types.some(type => {
          const requiredType = type.toLowerCase().trim();
          return certType.includes(requiredType) || 
                 certTitle.includes(requiredType) ||
                 requiredType.includes(certType) ||
                 requiredType.includes(certTitle);
        });
        
        const isValidAndVerified = cert.verificationStatus === 'verified' && 
                                  cert.isValid === true && 
                                  (!cert.expiryDate || new Date(cert.expiryDate) > new Date());
        
        console.log(`🔍 Checking ${item.label}:`, {
          certType,
          certTitle,
          typeMatches,
          isValidAndVerified,
          verificationStatus: cert.verificationStatus,
          isValid: cert.isValid
        });
        
        return typeMatches && isValidAndVerified;
      });
      
      if (!hasValidCert) {
        missing.push(item.label);
        console.log(`❌ Missing: ${item.label}`);
      } else {
        console.log(`✅ Found valid: ${item.label}`);
        // Check if expiring within 30 days
        const expiringSoon = staffCerts.some(cert => {
          const certType = (cert.type || '').toLowerCase().trim();
          const certTitle = (cert.title || '').toLowerCase().trim();
          
          const typeMatches = item.types.some(type => {
            const requiredType = type.toLowerCase().trim();
            return certType.includes(requiredType) || 
                   certTitle.includes(requiredType) ||
                   requiredType.includes(certType) ||
                   requiredType.includes(certTitle);
          });
          
          return typeMatches &&
                 cert.verificationStatus === 'verified' &&
                 cert.isValid === true &&
                 cert.expiryDate &&
                 (new Date(cert.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
        });
        
        if (expiringSoon) {
          expiring.push(item.label);
        }
      }
    }
    
    console.log('🎯 Compliance check result:', { missing, expiring });
    return { missing, expiring };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Certifications & Compliance</h2>
          <p className="text-gray-600 mt-1">Comprehensive certification tracking with compliance monitoring and verification workflows</p>
        </div>
        
        {/* Upload button for staff only (non-admin users) */}
        {!isAdmin && (
          <Button onClick={() => setShowUpload(true)} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Certificate
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by staff name, email, or certification type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-500 flex items-center whitespace-nowrap">
          {filteredCertifications.length} of {certifications.length} certifications
        </div>
      </div>

      {/* Upload Dialog */}
      {showUpload && (
        <SimpleDocumentUpload
          staffId={staffId || 0}
          onUploadComplete={() => {
            setShowUpload(false);
            queryClient.invalidateQueries({ queryKey: ['/api/compliance/records'] });
          }}
        />
      )}

      {/* Unified Staff Certifications View */}
      {isLoading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(2)].map((_, j) => (
                    <Skeleton key={j} className="h-32" />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedCertifications).map(([staffName, staffCerts]) => {
            const firstCert = staffCerts[0];
            return (
              <Card key={staffName} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{staffName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {staffCerts.length} Document{staffCerts.length !== 1 ? 's' : ''}
                          </span>
                          {(staffCerts as any[]).filter((c: any) => c.verificationStatus === 'verified').length > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              {(staffCerts as any[]).filter((c: any) => c.verificationStatus === 'verified').length} Verified
                            </span>
                          )}
                          {(staffCerts as any[]).filter((c: any) => c.verificationStatus === 'pending').length > 0 && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <FileText className="h-3 w-3" />
                              {(staffCerts as any[]).filter((c: any) => c.verificationStatus === 'pending').length} Pending
                            </span>
                          )}
                          {(staffCerts as any[]).filter((c: any) => c.verificationStatus === 'rejected').length > 0 && (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-3 w-3" />
                              {(staffCerts as any[]).filter((c: any) => c.verificationStatus === 'rejected').length} Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Compliance Alerts Section - Integrated */}
                  {(() => {
                    const complianceStatus = getComplianceStatus(staffCerts as any[]);
                    if (complianceStatus.missing.length > 0) {
                      return (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-red-800 mb-2">Missing Mandatory Items</h4>
                              <div className="flex flex-wrap gap-1">
                                {complianceStatus.missing.map((item, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="grid gap-4">
                    {/* Sort certifications to show verified items first */}
                    {[...staffCerts].sort((a, b) => {
                      // Priority order: verified > pending > rejected
                      const statusOrder = { 'verified': 0, 'pending': 1, 'rejected': 2 };
                      const aOrder = statusOrder[a.verificationStatus as keyof typeof statusOrder] ?? 3;
                      const bOrder = statusOrder[b.verificationStatus as keyof typeof statusOrder] ?? 3;
                      
                      if (aOrder !== bOrder) {
                        return aOrder - bOrder;
                      }
                      
                      // If same status, sort by title alphabetically
                      return (a.title || '').localeCompare(b.title || '');
                    }).map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">{cert.title}</h4>
                              {getStatusBadge(cert.verificationStatus)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {documentTypeLabels[cert.type] || cert.type}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                              {cert.issueDate && (
                                <div>
                                  <span className="block font-medium">Issue Date:</span>
                                  <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              
                              {cert.expiryDate && (
                                <div>
                                  <span className="block font-medium">Expiry Date:</span>
                                  <div className="flex items-center gap-2">
                                    <span>{new Date(cert.expiryDate).toLocaleDateString()}</span>
                                    {(() => {
                                      const expiryStatus = getExpiryStatus(cert.expiryDate);
                                      return expiryStatus && (
                                        <Badge 
                                          className={`text-xs
                                            ${expiryStatus.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                            ${expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                            ${expiryStatus.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                          `}
                                        >
                                          {expiryStatus.label}
                                        </Badge>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                              
                              {cert.fileName && (
                                <div>
                                  <span className="block font-medium">File:</span>
                                  <span>{cert.fileName}</span>
                                </div>
                              )}
                              
                              {cert.fileSize && (
                                <div>
                                  <span className="block font-medium">Size:</span>
                                  <span>{formatFileSize(cert.fileSize)}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-gray-400">
                              <div>
                                Uploaded: {new Date(cert.createdAt).toLocaleDateString()} at {new Date(cert.createdAt).toLocaleTimeString()}
                              </div>
                              {/* Show last updated by information for any admin portal user */}
                              {cert.verifiedByFirstName && cert.verifiedByLastName && cert.verifiedAt && (
                                <div className="text-xs text-blue-600 font-medium">
                                  Last Updated By: {cert.verifiedByFirstName} {cert.verifiedByLastName} on {new Date(cert.verifiedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleQuickView(cert)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Quick View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(cert.id, cert.fileName || 'document')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditDetails(cert)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                {isAdmin && (
                                  <>
                                    {cert.verificationStatus === 'pending' && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={() => handleApproval(cert.id, 'verified', undefined, cert.type)}
                                          className="text-green-600"
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Verify Document
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleApproval(cert.id, 'rejected', 'Document rejected by admin', cert.type)}
                                          className="text-red-600"
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Reject Document
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {cert.verificationStatus === 'verified' && (
                                      <DropdownMenuItem 
                                        onClick={() => handleApproval(cert.id, 'pending', 'Document marked for review', cert.type)}
                                        className="text-orange-600"
                                      >
                                        <Shield className="mr-2 h-4 w-4" />
                                        Mark for Review
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {Object.keys(groupedCertifications).length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matching certificates found' : 'No certificates found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters.'
                  : isAdmin 
                    ? 'No staff certificates have been uploaded yet.' 
                    : 'Upload your first certificate to get started.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Management Dialog */}
      <Dialog open={!!selectedCertForEdit} onOpenChange={() => setSelectedCertForEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Certification Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCertForEdit && (
              <>
                <div>
                  <Label className="text-sm font-medium">Document:</Label>
                  <p className="text-sm text-gray-600">{selectedCertForEdit.title}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Staff Member:</Label>
                  <p className="text-sm text-gray-600">{selectedCertForEdit.staffName}</p>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium">Verification Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add verification notes or rejection reasons..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleSaveStatusChanges}
                    disabled={approvalMutation.isPending}
                    className="flex-1"
                  >
                    {approvalMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedCertForEdit(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}