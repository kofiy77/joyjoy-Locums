import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Remove problematic import - will detect user type from API responses
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Eye,
  UserCheck,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DocumentUpload from "./document-upload";

interface Certification {
  id: string;
  type: string;
  title: string;
  issueDate?: string;
  expiryDate?: string;
  fileName?: string;
  fileSize?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isValid: boolean;
  createdAt: string;
  staffName?: string; // Added for admin view - shows which staff member the certification belongs to
}

const documentTypeLabels: Record<string, string> = {
  dbs_check: "DBS Check",
  first_aid: "First Aid Certificate",
  manual_handling: "Manual Handling Training",
  safeguarding: "Safeguarding Training",
  dementia_care: "Dementia Care Training",
  medication_admin: "Medication Administration",
  food_hygiene: "Food Hygiene Certificate",
  moving_handling: "Moving & Handling",
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'verified':
      return <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>;
  }
};

const getExpiryStatus = (expiryDate?: string) => {
  if (!expiryDate) return null;
  
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  if (expiry < now) {
    return { status: 'expired', color: 'red', label: 'Expired' };
  } else if (expiry < thirtyDaysFromNow) {
    return { status: 'expiring', color: 'yellow', label: 'Expiring Soon' };
  }
  return { status: 'valid', color: 'green', label: 'Valid' };
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function CertificationManager({ staffId }: { staffId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get user type from localStorage to determine admin status
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.type === 'admin' || user?.type === 'business_support';

  // Fetch certifications
  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ['/api/certifications'],
  });

  // Delete certification mutation
  const deleteMutation = useMutation({
    mutationFn: async (certId: string) => {
      return apiRequest(`/api/certifications/${certId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Your certification document has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Approval mutation for admin users
  const approvalMutation = useMutation({
    mutationFn: async ({ certId, status, notes }: { certId: string; status: 'verified' | 'rejected'; notes?: string }) => {
      return apiRequest(`/api/admin/certifications/${certId}/verification-update`, {
        method: 'PATCH',
        body: {
          verificationStatus: status,
          notes: notes
        }
      });
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      toast({
        title: "Success",
        description: `Document ${variables.status === 'verified' ? 'approved' : 'rejected'} successfully`
      });
      if (data?.statusUpdate) {
        console.log('User profile updated:', data.statusUpdate);
      }
    },
    onError: (error: any) => {
      console.error('Approval error:', error);
      toast({
        title: "Error",
        description: "Failed to update document status",
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

  const typedCertifications = certifications as Certification[];
  const activeCerts = typedCertifications.filter((cert: Certification) => cert.isValid);
  const pendingCerts = activeCerts.filter((cert: Certification) => cert.verificationStatus === 'pending');
  const verifiedCerts = activeCerts.filter((cert: Certification) => cert.verificationStatus === 'verified');
  const rejectedCerts = activeCerts.filter((cert: Certification) => cert.verificationStatus === 'rejected');

  // Group certificates by staff member for better organization
  const certsByStaff = useMemo(() => {
    const grouped: { [key: string]: Certification[] } = {};
    activeCerts.forEach(cert => {
      const staffName = cert.staffName || 'Unknown Staff';
      if (!grouped[staffName]) {
        grouped[staffName] = [];
      }
      grouped[staffName].push(cert);
    });
    return grouped;
  }, [activeCerts]);

  // Wrapper function for delete to match component signature
  const handleDelete = (certId: string) => {
    deleteMutation.mutate(certId);
  };

  // Wrapper function for approval
  const handleApproval = (certId: string, status: 'verified' | 'rejected', notes?: string) => {
    approvalMutation.mutate({ certId, status, notes });
  };

  if (showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Upload New Document</h2>
          <Button
            variant="outline"
            onClick={() => setShowUpload(false)}
          >
            Back to Documents
          </Button>
        </div>
        <DocumentUpload 
          staffId={staffId} 
          onUploadComplete={() => setShowUpload(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-gray-600">Manage your DBS, qualifications, and training certificates</p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{activeCerts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedCerts.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCerts.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activeCerts.filter(cert => {
                    const expiry = getExpiryStatus(cert.expiryDate);
                    return expiry?.status === 'expiring' || expiry?.status === 'expired';
                  }).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Lists */}
      <Tabs defaultValue="by-staff" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12 md:h-10 cert-status-tabs">
          <TabsTrigger value="by-staff" className="cert-status-trigger">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full hidden md:block" title="By Staff"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full md:hidden" title="By Staff"></div>
              <span className="hidden md:inline">By Staff ({Object.keys(certsByStaff).length})</span>
              <span className="md:hidden text-xs">Staff</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="all" className="cert-status-trigger">
            <span className="flex items-center gap-2">
              All Documents ({activeCerts.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="verified" className="cert-status-trigger">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full hidden md:block" title="Verified"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full md:hidden" title="Verified"></div>
              <span className="hidden md:inline">Verified ({verifiedCerts.length})</span>
              <span className="md:hidden text-xs">Verified</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending" className="cert-status-trigger">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full hidden md:block" title="Pending"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full md:hidden" title="Pending"></div>
              <span className="hidden md:inline">Pending ({pendingCerts.length})</span>
              <span className="md:hidden text-xs">Pending</span>
            </span>
          </TabsTrigger>
          <TabsTrigger value="expired" className="cert-status-trigger">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full hidden md:block" title="Expired"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full md:hidden" title="Expired"></div>
              <span className="hidden md:inline">Expiring ({activeCerts.filter(cert => {
                const expiry = getExpiryStatus(cert.expiryDate);
                return expiry?.status === 'expiring' || expiry?.status === 'expired';
              }).length})</span>
              <span className="md:hidden text-xs">Expired</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : activeCerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-600 mb-4">Upload your first document to get started</p>
                <Button onClick={() => setShowUpload(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeCerts.map((cert: Certification) => (
              <CertificationCard
                key={cert.id}
                certification={cert}
                onDownload={handleDownload}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
                onApprove={isAdmin ? handleApproval : undefined}
                isAdmin={isAdmin}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="by-staff" className="space-y-6">
          {Object.keys(certsByStaff).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff with documents</h3>
                <p className="text-gray-600">Documents will appear here grouped by staff member</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(certsByStaff).map(([staffName, staffCerts]) => (
              <Card key={staffName} className="overflow-hidden">
                <CardHeader className="bg-blue-50 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-blue-800">{staffName}</CardTitle>
                      <p className="text-blue-600 text-sm">
                        {staffCerts.length} document{staffCerts.length !== 1 ? 's' : ''} • 
                        {' '}{staffCerts.filter(c => c.verificationStatus === 'verified').length} verified • 
                        {' '}{staffCerts.filter(c => c.verificationStatus === 'pending').length} pending
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {staffCerts.some(c => c.verificationStatus === 'verified') && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Docs
                        </Badge>
                      )}
                      {staffCerts.some(c => c.verificationStatus === 'pending') && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Needs Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid gap-4 p-6">
                    {staffCerts.map((cert: Certification) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold">{cert.title}</h4>
                            {getStatusBadge(cert.verificationStatus)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Type:</span> {documentTypeLabels[cert.type] || cert.type}
                            </div>
                            {cert.issueDate && (
                              <div>
                                <span className="font-medium">Issue Date:</span> {new Date(cert.issueDate).toLocaleDateString()}
                              </div>
                            )}
                            {cert.expiryDate && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Expires:</span> 
                                <span>{new Date(cert.expiryDate).toLocaleDateString()}</span>
                                {(() => {
                                  const expiry = getExpiryStatus(cert.expiryDate);
                                  return expiry && (
                                    <Badge 
                                      className={`
                                        ${expiry.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                                        ${expiry.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                                        ${expiry.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                                      `}
                                    >
                                      {expiry.label}
                                    </Badge>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(cert.id, cert.fileName || 'document')}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            View
                          </Button>
                          {isAdmin && cert.verificationStatus === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproval(cert.id, 'verified')}
                                className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproval(cert.id, 'rejected', 'Document rejected by admin')}
                                className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verifiedCerts.map((cert: Certification) => (
            <CertificationCard
              key={cert.id}
              certification={cert}
              onDownload={handleDownload}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
              onApprove={isAdmin ? handleApproval : undefined}
              isAdmin={isAdmin}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingCerts.map((cert: Certification) => (
            <CertificationCard
              key={cert.id}
              certification={cert}
              onDownload={handleDownload}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
              onApprove={isAdmin ? handleApproval : undefined}
              isAdmin={isAdmin}
            />
          ))}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          {activeCerts.filter(cert => {
            const expiry = getExpiryStatus(cert.expiryDate);
            return expiry?.status === 'expiring' || expiry?.status === 'expired';
          }).map((cert: Certification) => (
            <CertificationCard
              key={cert.id}
              certification={cert}
              onDownload={handleDownload}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
              onApprove={isAdmin ? handleApproval : undefined}
              isAdmin={isAdmin}
            />
          ))}
        </TabsContent>
      </Tabs>


    </div>
  );
}


function CertificationCard({ 
  certification, 
  onDownload, 
  onDelete, 
  isDeleting,
  onApprove,
  isAdmin
}: { 
  certification: Certification;
  onDownload: (id: string, fileName: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onApprove?: (certId: string, status: 'verified' | 'rejected', notes?: string) => void;
  isAdmin?: boolean;
}) {
  const expiryStatus = getExpiryStatus(certification.expiryDate);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">{certification.title}</h3>
              {getStatusBadge(certification.verificationStatus)}
            </div>
            
            {/* Staff Name - prominently displayed for admin users */}
            {certification.staffName && (
              <div className="mb-2">
                <span className="text-sm text-gray-500">Staff Member:</span>
                <p className="font-semibold text-blue-700">{certification.staffName}</p>
              </div>
            )}
            
            <p className="text-gray-600 mb-3">
              {documentTypeLabels[certification.type] || certification.type}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {certification.issueDate && (
                <div>
                  <span className="text-gray-500">Issue Date:</span>
                  <p className="font-medium">{new Date(certification.issueDate).toLocaleDateString()}</p>
                </div>
              )}
              
              {certification.expiryDate && (
                <div>
                  <span className="text-gray-500">Expiry Date:</span>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{new Date(certification.expiryDate).toLocaleDateString()}</p>
                    {expiryStatus && (
                      <Badge 
                        className={`
                          ${expiryStatus.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                          ${expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                          ${expiryStatus.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        `}
                      >
                        {expiryStatus.label}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {certification.fileName && (
                <div>
                  <span className="text-gray-500">File:</span>
                  <p className="font-medium">{certification.fileName}</p>
                </div>
              )}
              
              {certification.fileSize && (
                <div>
                  <span className="text-gray-500">Size:</span>
                  <p className="font-medium">{formatFileSize(certification.fileSize)}</p>
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Uploaded: {new Date(certification.createdAt).toLocaleDateString()} at {new Date(certification.createdAt).toLocaleTimeString()}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(certification.id, certification.fileName || 'document')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            
            {/* Only show delete button for pending documents (staff only) */}
            {certification.verificationStatus === 'pending' && !isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(certification.id)}
                disabled={isDeleting}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            
            {/* Admin approval buttons for pending documents */}
            {isAdmin && certification.verificationStatus === 'pending' && onApprove && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(certification.id, 'verified')}
                  className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                >
                  <CheckCircle className="h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApprove(certification.id, 'rejected', 'Document rejected by admin')}
                  className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}