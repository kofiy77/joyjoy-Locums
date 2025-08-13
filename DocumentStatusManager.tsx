import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Edit3, Save, X, Search, Filter, Calendar, Building, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// import { apiRequest } from '@/lib/queryClient';

interface DocumentInfo {
  id: string;
  storagePath: string;
  filename: string;
  title: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  entityType: string;
  entityId: string;
  status: 'pending' | 'verified' | 'expired' | 'archived';
  documentType: string;
  notes?: string;
  publicUrl: string;
  practiceName?: string;
}

interface DocumentStatusManagerProps {
  documents: DocumentInfo[];
  onStatusUpdate?: () => void;
  showEntityInfo?: boolean;
  onEditDocument?: (document: DocumentInfo) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'archived':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Secure document viewer component
const SecureDocumentViewer: React.FC<{ document: DocumentInfo }> = ({ document }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');

  const generateDocumentUrl = () => {
    // Create the direct endpoint URL for streaming the document
    const url = `/api/documents/view/${document.entityType}/${encodeURIComponent(document.storagePath)}`;
    setDocumentUrl(url);
  };

  const testDocumentAccess = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(documentUrl, {
        method: 'HEAD', // Test access without downloading
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Document access failed: ${response.status}`);
      }
    } catch (err) {
      setError('Failed to access document');
      console.error('Document access error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateDocumentUrl();
  }, [document.entityType, document.storagePath]);

  useEffect(() => {
    if (documentUrl) {
      testDocumentAccess();
    }
  }, [documentUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-500">
        <div className="text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !documentUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
        <FileText className="h-12 w-12 mb-2" />
        <p>{error || 'Document not available'}</p>
        <Button
          variant="link"
          onClick={testDocumentAccess}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (document.mimeType.startsWith('image/')) {
    return (
      <img 
        src={documentUrl} 
        alt={document.title}
        className="max-w-full max-h-[70vh] object-contain mx-auto"
        onError={() => setError('Failed to load image')}
      />
    );
  }

  if (document.mimeType === 'application/pdf') {
    return (
      <iframe
        src={documentUrl}
        className="w-full h-[70vh] border rounded"
        title={document.title}
        onError={() => setError('Failed to load PDF')}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
      <FileText className="h-12 w-12 mb-2" />
      <p>Preview not available for this file type</p>
      <Button
        variant="link"
        onClick={() => window.open(documentUrl, '_blank')}
        className="mt-2"
      >
        Download File
      </Button>
    </div>
  );
};

const DocumentStatusManager: React.FC<DocumentStatusManagerProps> = ({ 
  documents, 
  onStatusUpdate,
  showEntityInfo = false,
  onEditDocument
}) => {
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});
  const [notesUpdates, setNotesUpdates] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [practiceFilter, setPracticeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const { toast } = useToast();

  // Dynamic filter options based on available documents
  const filterOptions = useMemo(() => {
    const statuses = Array.from(new Set(documents.map(doc => doc.status)));
    const documentTypes = Array.from(new Set(documents.map(doc => doc.documentType).filter(Boolean)));
    const entityTypes = Array.from(new Set(documents.map(doc => doc.entityType)));
    const practices = Array.from(new Set(documents.map(doc => doc.practiceName).filter(Boolean)));
    
    return {
      statuses,
      documentTypes,
      entityTypes,
      practices
    };
  }, [documents]);

  // Filtered documents based on all active filters
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.notes && doc.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doc.practiceName && doc.practiceName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesDocumentType = documentTypeFilter === 'all' || doc.documentType === documentTypeFilter;
      const matchesEntityType = entityTypeFilter === 'all' || doc.entityType === entityTypeFilter;
      const matchesPractice = practiceFilter === 'all' || doc.practiceName === practiceFilter;
      
      const matchesDate = dateFilter === 'all' || (() => {
        const docDate = new Date(doc.uploadedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          case 'quarter': return daysDiff <= 90;
          default: return true;
        }
      })();

      return matchesSearch && matchesStatus && matchesDocumentType && 
             matchesEntityType && matchesPractice && matchesDate;
    });
  }, [documents, searchTerm, statusFilter, documentTypeFilter, entityTypeFilter, practiceFilter, dateFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDocumentTypeFilter('all');
    setEntityTypeFilter('all');
    setPracticeFilter('all');
    setDateFilter('all');
  };

  const activeFiltersCount = [searchTerm, statusFilter, documentTypeFilter, entityTypeFilter, practiceFilter, dateFilter]
    .filter(filter => filter !== '' && filter !== 'all').length;

  const updateDocumentStatus = async (document: DocumentInfo, newStatus: string) => {
    try {
      setIsUpdating(true);
      
      await fetch(`/api/documents/${encodeURIComponent(document.storagePath)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
        headers: { 'Content-Type': 'application/json' }
      });

      toast({
        title: "Status Updated",
        description: `Document status changed to ${newStatus}`,
      });

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Update Failed",
        description: "Could not update document status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateDocumentNotes = async (document: DocumentInfo, newNotes: string) => {
    try {
      setIsUpdating(true);
      
      await fetch(`/api/documents/${encodeURIComponent(document.storagePath)}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: newNotes }),
        headers: { 'Content-Type': 'application/json' }
      });

      toast({
        title: "Notes Updated",
        description: "Document notes have been saved",
      });

      setEditingDocument(null);
      setNotesUpdates(prev => ({ ...prev, [document.id]: '' }));
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Notes update error:', error);
      toast({
        title: "Update Failed",
        description: "Could not update document notes",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Filter Bar */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Document Filters {activeFiltersCount > 0 && `(${activeFiltersCount} active)`}
            </CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents, notes, or practices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Status Filter */}
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {filterOptions.statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Filter */}
            <div>
              <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions.documentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {filterOptions.entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {type === 'staff' && <Users className="h-4 w-4" />}
                        {type === 'practice' && <Building className="h-4 w-4" />}
                        {type === 'admin' && <FileText className="h-4 w-4" />}
                        {type.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Practice Filter (only show if practices exist) */}
            {filterOptions.practices.length > 0 && (
              <div>
                <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="GP Practice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All GP Practices</SelectItem>
                    {filterOptions.practices.map(practice => (
                      <SelectItem key={practice} value={practice}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {practice}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Upload Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <span>
              Showing {filteredDocuments.length} of {documents.length} documents
            </span>
            {filteredDocuments.length !== documents.length && (
              <span className="text-blue-600">
                {documents.length - filteredDocuments.length} filtered out
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtered Documents */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
            <p className="text-gray-600 mb-4">
              {activeFiltersCount > 0 
                ? "Try adjusting your filters to see more documents."
                : "No documents match your current criteria."
              }
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        filteredDocuments.map((document) => (
          <Card key={document.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-base font-medium">{document.title}</CardTitle>
                  <p className="text-sm text-gray-500">{document.filename}</p>
                  {showEntityInfo && document.practiceName && (
                    <p className="text-sm text-blue-600 font-medium">{document.practiceName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                <Select
                  value={statusUpdates[document.id] || document.status}
                  onValueChange={(value) => {
                    setStatusUpdates(prev => ({ ...prev, [document.id]: value }));
                    updateDocumentStatus(document, value);
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Type:</span> {document.documentType}
              </div>
              <div>
                <span className="font-medium">Size:</span> {formatFileSize(document.fileSize)}
              </div>
              <div>
                <span className="font-medium">Uploaded:</span> {formatDate(document.uploadedAt)}
              </div>
              <div>
                <span className="font-medium">Format:</span> {document.mimeType.split('/')[1]?.toUpperCase()}
              </div>
            </div>

            {/* Notes Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Notes</span>
                {editingDocument !== document.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingDocument(document.id);
                      setNotesUpdates(prev => ({ ...prev, [document.id]: document.notes || '' }));
                    }}
                    className="h-8 px-2"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                ) : (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDocumentNotes(document, notesUpdates[document.id] || '')}
                      disabled={isUpdating}
                      className="h-8 px-2"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingDocument(null);
                        setNotesUpdates(prev => ({ ...prev, [document.id]: '' }));
                      }}
                      className="h-8 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {editingDocument === document.id ? (
                <Textarea
                  value={notesUpdates[document.id] || ''}
                  onChange={(e) => setNotesUpdates(prev => ({ ...prev, [document.id]: e.target.value }))}
                  placeholder="Add notes about this document..."
                  className="min-h-[80px] text-sm"
                />
              ) : (
                <div className="min-h-[80px] p-3 bg-gray-50 rounded-md text-sm">
                  {document.notes ? (
                    <p className="whitespace-pre-wrap">{document.notes}</p>
                  ) : (
                    <p className="text-gray-400 italic">No notes added</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>{document.title}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <SecureDocumentViewer document={document} />
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Edit Document Button */}
              {onEditDocument && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEditDocument(document)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        ))
      )}
    </div>
  );
};

export default DocumentStatusManager;