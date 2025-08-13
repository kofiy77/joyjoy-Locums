import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Calendar, 
  Search, 
  Filter,
  AlertTriangle,
  Building,
  Scale,
  FileCheck,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface InternalDocument {
  id: string;
  title: string;
  description?: string;
  document_type: string;
  category: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  status: string;
  access_level: string;
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  version: string;
  tags?: string[];
  care_home_id?: string;
  care_home_name?: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
}

const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contract', icon: FileCheck },
  { value: 'legal', label: 'Legal', icon: Scale },
  { value: 'care_facility', label: 'Care Facility', icon: Building },
  { value: 'policy', label: 'Policy', icon: FileText },
  { value: 'procedure', label: 'Procedure', icon: FileText },
  { value: 'agreement', label: 'Agreement', icon: FileCheck },
  { value: 'compliance', label: 'Compliance', icon: FileCheck },
  { value: 'insurance', label: 'Insurance', icon: FileText },
  { value: 'license', label: 'License', icon: FileCheck },
  { value: 'certification', label: 'Certification', icon: FileCheck }
];

const CATEGORIES = [
  'staff_contracts', 'care_home_agreements', 'insurance_policies',
  'legal_documents', 'compliance_certificates', 'operational_procedures',
  'health_safety_policies', 'data_protection', 'safeguarding',
  'cqc_documentation', 'fire_safety', 'risk_assessments'
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' }
];

export default function InternalDocumentManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    document_type: '',
    category: '',
    access_level: 'admin_only',
    effective_date: '',
    expiry_date: '',
    review_date: '',
    tags: '',
    care_home_id: ''
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    document_type: '',
    category: '',
    access_level: 'admin_only',
    effective_date: '',
    expiry_date: '',
    review_date: '',
    tags: '',
    care_home_id: '',
    status: 'active',
    version: '1.0'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch internal documents
  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['/api/internal-documents'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/internal-documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    }
  });

  // Fetch care homes for dropdown
  const { data: careHomes = [] } = useQuery({
    queryKey: ['/api/admin/care-homes'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/care-homes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch care homes');
      return response.json();
    }
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');

      const formData = new FormData();
      formData.append('file', selectedFile);
      Object.entries(uploadForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/internal-documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        description: '',
        document_type: '',
        category: '',
        access_level: 'admin_only',
        effective_date: '',
        expiry_date: '',
        review_date: '',
        tags: '',
        care_home_id: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/internal-documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Edit document mutation
  const editDocumentMutation = useMutation({
    mutationFn: async () => {
      if (!editingDocument) throw new Error('No document selected for editing');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/internal-documents/${editingDocument.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
      setShowEditDialog(false);
      setEditingDocument(null);
      queryClient.invalidateQueries({ queryKey: ['/api/internal-documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update document",
        variant: "destructive",
      });
    }
  });

  // Filter documents
  const filteredDocuments = documents.filter((doc: InternalDocument) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.document_type === selectedType;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return statusConfig || { value: status, label: status, color: 'bg-gray-100 text-gray-800' };
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Check if document is expiring soon
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  // Get document type icon
  const getDocumentTypeIcon = (type: string) => {
    const typeConfig = DOCUMENT_TYPES.find(t => t.value === type);
    return typeConfig?.icon || FileText;
  };

  const handleViewDocument = async (documentId: string) => {
    const document = filteredDocuments.find(d => d.id === documentId);
    
    // Check if document has a valid file path
    if (!document?.file_path || document.file_path === 'null') {
      toast({
        title: "No File Available",
        description: "This is a sample document without an uploaded file. Upload a file to view it.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/internal-documents/${documentId}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        throw new Error('Failed to load document');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open document",
        variant: "destructive",
      });
    }
  };

  const handleEditDocument = (document: any) => {
    setEditingDocument(document);
    setEditForm({
      title: document.title || '',
      description: document.description || '',
      document_type: document.document_type || '',
      category: document.category || '',
      access_level: document.access_level || 'admin_only',
      effective_date: document.effective_date ? document.effective_date.split('T')[0] : '',
      expiry_date: document.expiry_date ? document.expiry_date.split('T')[0] : '',
      review_date: document.review_date ? document.review_date.split('T')[0] : '',
      tags: document.tags || '',
      care_home_id: document.care_home_id || '',
      status: document.status || 'active',
      version: document.version || '1.0'
    });
    setShowEditDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading internal documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4" />
            <p>Failed to load documents</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Internal Document Management</h2>
          <p className="text-gray-600">Manage contracts, legal documents, and care facility documentation</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Internal Document</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="Enter document title"
                  />
                </div>
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select value={uploadForm.document_type} onValueChange={(value) => setUploadForm({...uploadForm, document_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="access_level">Access Level</Label>
                  <Select value={uploadForm.access_level} onValueChange={(value) => setUploadForm({...uploadForm, access_level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin_only">Admin Only</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="care_home_managers">Care Home Managers</SelectItem>
                      <SelectItem value="all_staff">All Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Brief description of the document"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="effective_date">Effective Date</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={uploadForm.effective_date}
                    onChange={(e) => setUploadForm({...uploadForm, effective_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={uploadForm.expiry_date}
                    onChange={(e) => setUploadForm({...uploadForm, expiry_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="review_date">Review Date</Label>
                  <Input
                    id="review_date"
                    type="date"
                    value={uploadForm.review_date}
                    onChange={(e) => setUploadForm({...uploadForm, review_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="care_home">Care Home (Optional)</Label>
                  <Select value={uploadForm.care_home_id} onValueChange={(value) => setUploadForm({...uploadForm, care_home_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All care homes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All care homes</SelectItem>
                      {careHomes.map((home: any) => (
                        <SelectItem key={home.id} value={home.id}>{home.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                    placeholder="e.g. urgent, annual, compliance"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => uploadDocumentMutation.mutate()}
                disabled={!selectedFile || !uploadForm.title || !uploadForm.document_type || uploadDocumentMutation.isPending}
              >
                {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Documents</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document: InternalDocument) => {
          const DocumentIcon = getDocumentTypeIcon(document.document_type);
          const statusBadge = getStatusBadge(document.status);
          const expiringSoon = isExpiringSoon(document.expiry_date);

          return (
            <Card key={document.id} className={`hover:shadow-lg transition-shadow ${expiringSoon ? 'border-orange-200 bg-orange-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className="w-5 h-5 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base font-semibold truncate">{document.title}</CardTitle>
                      <p className="text-sm text-gray-600 truncate">v{document.version}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleViewDocument(document.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditDocument(document)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {document.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusBadge.color}>
                      {statusBadge.label}
                    </Badge>
                    <Badge variant="outline">
                      {document.document_type.replace(/_/g, ' ')}
                    </Badge>
                    {expiringSoon && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>File:</span>
                      <span className="truncate ml-2">{document.file_name}</span>
                    </div>
                    {document.file_size && (
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{formatFileSize(document.file_size)}</span>
                      </div>
                    )}
                    {document.care_home_name && (
                      <div className="flex justify-between">
                        <span>Care Home:</span>
                        <span className="truncate ml-2">{document.care_home_name}</span>
                      </div>
                    )}
                    {document.expiry_date && (
                      <div className="flex justify-between">
                        <span>Expires:</span>
                        <span>{new Date(document.expiry_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{new Date(document.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewDocument(document.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? "Try adjusting your filters to see more documents."
                : "Get started by uploading your first internal document."}
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileCheck className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold">
                {documents.filter((d: InternalDocument) => d.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold">
                {documents.filter((d: InternalDocument) => isExpiringSoon(d.expiry_date)).length}
              </p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold">
                {documents.filter((d: InternalDocument) => d.status === 'under_review').length}
              </p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update the document details and metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Document Title */}
            <div>
              <Label htmlFor="edit-title">Document Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Enter document title"
              />
            </div>

            {/* Document Type */}
            <div>
              <Label htmlFor="edit-type">Document Type</Label>
              <Select value={editForm.document_type} onValueChange={(value) => setEditForm({...editForm, document_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access Level */}
            <div>
              <Label htmlFor="edit-access">Access Level</Label>
              <Select value={editForm.access_level} onValueChange={(value) => setEditForm({...editForm, access_level: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin_only">Admin Only</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="care_home_managers">Care Home Managers</SelectItem>
                  <SelectItem value="all_staff">All Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Version */}
            <div>
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={editForm.version}
                onChange={(e) => setEditForm({...editForm, version: e.target.value})}
                placeholder="e.g., 1.0, 2.1"
              />
            </div>

            {/* Effective Date */}
            <div>
              <Label htmlFor="edit-effective">Effective Date</Label>
              <Input
                id="edit-effective"
                type="date"
                value={editForm.effective_date}
                onChange={(e) => setEditForm({...editForm, effective_date: e.target.value})}
              />
            </div>

            {/* Expiry Date */}
            <div>
              <Label htmlFor="edit-expiry">Expiry Date</Label>
              <Input
                id="edit-expiry"
                type="date"
                value={editForm.expiry_date}
                onChange={(e) => setEditForm({...editForm, expiry_date: e.target.value})}
              />
            </div>

            {/* Review Date */}
            <div>
              <Label htmlFor="edit-review">Review Date</Label>
              <Input
                id="edit-review"
                type="date"
                value={editForm.review_date}
                onChange={(e) => setEditForm({...editForm, review_date: e.target.value})}
              />
            </div>

            {/* Care Home (Optional) */}
            <div>
              <Label htmlFor="edit-care-home">Care Home (Optional)</Label>
              <Select value={editForm.care_home_id} onValueChange={(value) => setEditForm({...editForm, care_home_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All care homes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All care homes</SelectItem>
                  {careHomes.map((home: any) => (
                    <SelectItem key={home.id} value={home.id}>{home.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="col-span-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                placeholder="e.g., urgent, annual, compliance"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editDocumentMutation.mutate()}
              disabled={editDocumentMutation.isPending}
            >
              {editDocumentMutation.isPending ? 'Updating...' : 'Update Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}