import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  Users,
  Shield,
  MoreHorizontal,
  Calendar,
  User
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  entityType: 'staff' | 'care_home' | 'admin' | 'system';
  entityId?: string;
  entityName?: string;
  careHomeName?: string;
  uploadedBy?: string;
  uploadedAt: string;
  expiryDate?: string;
  notes?: string;
  fileUrl?: string;
  publicUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath?: string;
}

interface ComprehensiveDocumentManagementProps {
  onRefresh: () => void;
}

export default function ComprehensiveDocumentManagement({ onRefresh }: ComprehensiveDocumentManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterCareHome, setFilterCareHome] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  // Upload form state
  const [uploadData, setUploadData] = useState({
    title: "",
    documentType: "",
    entityType: "staff",
    entityId: "",
    notes: "",
    expiryDate: "",
    file: null as File | null
  });

  // Data queries
  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/admin/documents']
  });

  console.log('Documents query state:', { 
    documents, 
    isLoading, 
    error: error?.message || error, 
    documentsLength: documents?.length,
    documentsType: typeof documents,
    isArray: Array.isArray(documents)
  });

  const { data: careHomes = [] } = useQuery({
    queryKey: ['/api/admin/care-homes']
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['/api/admin/staff']
  });

  // Document types for different entities
  const documentTypes = {
    staff: [
      'Identity Document',
      'Right to Work',
      'DBS Certificate',
      'Professional Qualification',
      'Training Certificate',
      'Medical Certificate',
      'Reference Letter',
      'Contract'
    ],
    care_home: [
      'CQC Registration',
      'Insurance Certificate',
      'Fire Safety Certificate',
      'Health & Safety Policy',
      'Safeguarding Policy',
      'Contract Agreement',
      'Compliance Report',
      'Inspection Report'
    ],
    admin: [
      'System Policy',
      'Audit Report',
      'Legal Document',
      'Compliance Certificate',
      'Technical Documentation'
    ],
    system: [
      'Backup Report',
      'Security Audit',
      'System Configuration',
      'Update Log'
    ]
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'x-user-id': localStorage.getItem('auth-storage') ? 
            JSON.parse(localStorage.getItem('auth-storage')!)?.state?.user?.id : ''
        }
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Document uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      setShowUploadDialog(false);
      resetUploadForm();
      onRefresh();
    },
    onError: (error: any) => {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ docId, action, notes }: any) => 
      apiRequest(`/api/admin/documents/${docId}/verify`, 'POST', { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({ title: "Document verification updated" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => 
      apiRequest(`/api/admin/documents/${docId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] });
      toast({ title: "Document deleted successfully" });
      onRefresh();
    }
  });

  // Filtering logic
  const filteredDocuments = Array.isArray(documents) ? documents.filter((doc: Document) => {
    const matchesSearch = !searchTerm || 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.careHomeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    const matchesEntity = filterEntity === 'all' || doc.entityType === filterEntity;
    
    const matchesDateRange = dateRange === 'all' || (() => {
      const docDate = new Date(doc.uploadedAt);
      const now = new Date();
      switch (dateRange) {
        case 'week':
          return docDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
          return docDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'quarter':
          return docDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesType && matchesEntity && matchesDateRange;
  }) : [];

  // Reset upload form
  const resetUploadForm = () => {
    setUploadData({
      title: "",
      documentType: "",
      entityType: "staff",
      entityId: "",
      notes: "",
      expiryDate: "",
      file: null
    });
  };

  // Handle file upload
  const handleUpload = () => {
    if (!uploadData.file || !uploadData.title || !uploadData.documentType) {
      toast({ 
        title: "Missing required fields", 
        description: "Please fill in all required fields and select a file",
        variant: "destructive" 
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('documentType', uploadData.documentType);
    formData.append('entityType', uploadData.entityType);
    formData.append('entityId', uploadData.entityId);
    formData.append('notes', uploadData.notes);
    formData.append('expiryDate', uploadData.expiryDate);

    uploadMutation.mutate(formData);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'expired': return <Badge className="bg-orange-100 text-orange-800">Expired</Badge>;
      case 'pending': return <Badge variant="secondary">Pending Review</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get entity icon
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'staff': return <Users className="h-4 w-4" />;
      case 'care_home': return <Building2 className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'system': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comprehensive Document Management System
          </div>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardTitle>
        <CardDescription>
          Advanced document management with validation workflows, compliance tracking, and secure storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Advanced Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by title, type, entity, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="staff">Staff Documents</SelectItem>
                <SelectItem value="care_home">Care Home Documents</SelectItem>
                <SelectItem value="admin">Admin Documents</SelectItem>
                <SelectItem value="system">System Documents</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Identity Document">Identity Document</SelectItem>
                <SelectItem value="Right to Work">Right to Work</SelectItem>
                <SelectItem value="DBS Certificate">DBS Certificate</SelectItem>
                <SelectItem value="CQC Registration">CQC Registration</SelectItem>
                <SelectItem value="Insurance Certificate">Insurance Certificate</SelectItem>
                <SelectItem value="Training Certificate">Training Certificate</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="quarter">Past Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline">
              {filteredDocuments.length} of {Array.isArray(documents) ? documents.length : 0} documents
            </Badge>
            <Badge variant="secondary">
              {filteredDocuments.filter((d: Document) => d.status === 'pending').length} pending
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              {filteredDocuments.filter((d: Document) => d.status === 'approved').length} approved
            </Badge>
            <Badge variant="destructive">
              {filteredDocuments.filter((d: Document) => d.status === 'rejected').length} rejected
            </Badge>
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load documents</h3>
              <p className="text-gray-500">
                Error loading documents: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
              <Button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/documents'] })}
                className="mt-4"
              >
                Retry Loading
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500">
                {documents.length === 0 ? 'No documents available in the system.' : 'No documents match your current filter criteria.'}
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc: Document) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(doc.entityType)}
                        <div>
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                          <p className="text-gray-600">{doc.documentType}</p>
                        </div>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{doc.entityType.replace('_', ' ')}: {doc.careHomeName || doc.entityName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {doc.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Expires: {new Date(doc.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{(doc.fileSize / 1024).toFixed(1)}KB</span>
                      </div>
                    </div>

                    {doc.notes && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600">{doc.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedDocument(doc);
                        setShowPreviewDialog(true);
                      }}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {doc.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => 
                            verifyMutation.mutate({ docId: doc.id, action: 'approve', notes: '' })
                          }>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => 
                            verifyMutation.mutate({ docId: doc.id, action: 'reject', notes: 'Requires revision' })
                          }>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedDocument(doc);
                          setShowEditDialog(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this document?')) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload and categorize documents with validation and compliance tracking
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter document title"
                  />
                </div>
                <div>
                  <Label htmlFor="entityType">Entity Type *</Label>
                  <Select value={uploadData.entityType} onValueChange={(value) => 
                    setUploadData(prev => ({ ...prev, entityType: value, documentType: "" }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff Document</SelectItem>
                      <SelectItem value="care_home">Care Home Document</SelectItem>
                      <SelectItem value="admin">Admin Document</SelectItem>
                      <SelectItem value="system">System Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select value={uploadData.documentType} onValueChange={(value) => 
                    setUploadData(prev => ({ ...prev, documentType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes[uploadData.entityType as keyof typeof documentTypes]?.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={uploadData.expiryDate}
                    onChange={(e) => setUploadData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file">Select File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadData(prev => ({ 
                    ...prev, 
                    file: e.target.files?.[0] || null 
                  }))}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={uploadData.notes}
                  onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes or comments"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedDocument?.title}</DialogTitle>
              <DialogDescription>
                {selectedDocument?.documentType} • {selectedDocument?.entityType}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDocument && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Status: {getStatusBadge(selectedDocument.status)}</div>
                    <div>Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleString()}</div>
                    <div>File Size: {(selectedDocument.fileSize / 1024).toFixed(1)}KB</div>
                    {selectedDocument.expiryDate && (
                      <div>Expires: {new Date(selectedDocument.expiryDate).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                
                {selectedDocument.mimeType.startsWith('image/') ? (
                  <img 
                    src={`/api/documents/view/${selectedDocument.id}`}
                    alt={selectedDocument.title}
                    className="max-w-full h-auto border rounded"
                  />
                ) : selectedDocument.mimeType === 'application/pdf' ? (
                  <iframe
                    src={`/api/documents/view/${selectedDocument.id}`}
                    className="w-full h-96 border rounded"
                    title={selectedDocument.title}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Preview not available for this file type</p>
                    <Button variant="outline" className="mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}