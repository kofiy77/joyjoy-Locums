import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus, FileText, Building, User, Settings } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DocumentInfo {
  id: string;
  storagePath: string;
  publicUrl: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  entityType: string;
  entityId: string;
  title: string;
  status: 'pending' | 'verified' | 'expired' | 'archived';
  documentType: string;
  notes?: string;
  expiryDate?: Date;
  issuedDate?: Date;
  tags?: string[];
  uploadedBy?: string;
}

interface DocumentEditPopupProps {
  document: DocumentInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: any) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800 border-gray-300' }
];

const documentCategories = {
  staff: [
    'DBS Check', 'RTW (Right to Work)', 'Training Certificates', 'Regulatory Documents',
    'Legal Documents', 'Identity Documents', 'CV/Resume', 'Qualifications',
    'References', 'Medical Clearance', 'Emergency Contacts', 'Occupational Health',
    'Professional Registration', 'Mandatory Training', 'Safeguarding Training',
    'Fire Safety Training', 'First Aid Certificate', 'Moving & Handling'
  ],
  care_home: [
    'CQC Registration', 'Regulatory Compliance', 'Legal Documents', 'Insurance Documents',
    'Safety Certificates', 'Policies & Procedures', 'Staff Contracts', 'Compliance Reports',
    'Financial Documents', 'Inspection Reports', 'Training Records', 'DBS Policies',
    'Safeguarding Policies', 'Health & Safety', 'Fire Risk Assessment', 'COSHH Assessments',
    'Medication Management', 'Data Protection', 'Business Continuity'
  ],
  admin: [
    'Invoices', 'Reports', 'Contracts', 'Legal Documents', 'Regulatory Documents',
    'System Documentation', 'Audit Reports', 'Feedback Forms', 'Training Records',
    'Compliance Documentation', 'Risk Assessments', 'Policy Documents',
    'Business Registration', 'Tax Documents', 'Employment Law'
  ]
};

export function DocumentEditPopup({ document, isOpen, onClose, onSave }: DocumentEditPopupProps) {
  const [formData, setFormData] = useState({
    title: '',
    status: 'pending' as const,
    documentType: '',
    notes: '',
    expiryDate: null as Date | null,
    issuedDate: null as Date | null,
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [isExpiryCalendarOpen, setIsExpiryCalendarOpen] = useState(false);
  const [isIssuedCalendarOpen, setIsIssuedCalendarOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form data when document changes
  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        status: document.status || 'pending',
        documentType: document.documentType || '',
        notes: document.notes || '',
        expiryDate: document.expiryDate ? new Date(document.expiryDate) : null,
        issuedDate: document.issuedDate ? new Date(document.issuedDate) : null,
        tags: document.tags || []
      });
    }
  }, [document]);

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!document) throw new Error('No document selected');
      
      const response = await fetch(`/api/documents/${encodeURIComponent(document.storagePath)}/metadata`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update document metadata');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Updated",
        description: "Document metadata has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/all-documents'] });
      onSave(formData);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update document metadata.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updates = {
      title: formData.title,
      status: formData.status,
      documentType: formData.documentType,
      notes: formData.notes,
      expiryDate: formData.expiryDate?.toISOString(),
      issuedDate: formData.issuedDate?.toISOString(),
      tags: formData.tags
    };

    updateMutation.mutate(updates);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'staff': return User;
      case 'care_home': return Building;
      case 'admin': return Settings;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!document) return null;

  const EntityIcon = getEntityIcon(document.entityType);
  const availableCategories = documentCategories[document.entityType] || [];
  const currentStatus = statusOptions.find(s => s.value === formData.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <EntityIcon className="h-5 w-5" />
            Edit Document Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Document Info */}
          <div className="space-y-4">
            {/* Document Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{document.filename}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(document.fileSize)} • Uploaded {format(new Date(document.uploadedAt), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <EntityIcon className="h-3 w-3" />
                    <span className="text-xs text-gray-600 capitalize">{document.entityType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Basic Information</h4>
              
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <Label htmlFor="documentType">Document Category</Label>
                <Select value={formData.documentType} onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue>
                      {currentStatus && (
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", currentStatus.color.replace('text-', 'bg-').replace('border-', '').replace('bg-', ''))}></div>
                          {currentStatus.label}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", status.color.replace('text-', 'bg-').replace('border-', '').replace('bg-', ''))}></div>
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Column - Advanced Details */}
          <div className="space-y-4">
            {/* Dates */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Important Dates</h4>
              
              <div>
                <Label>Issued Date</Label>
                <Popover open={isIssuedCalendarOpen} onOpenChange={setIsIssuedCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !formData.issuedDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.issuedDate ? format(formData.issuedDate, "PPP") : "Select issued date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.issuedDate || undefined}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, issuedDate: date || null }));
                        setIsIssuedCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Expiry Date</Label>
                <Popover open={isExpiryCalendarOpen} onOpenChange={setIsExpiryCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !formData.expiryDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? format(formData.expiryDate, "PPP") : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate || undefined}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, expiryDate: date || null }));
                        setIsExpiryCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Tags</h4>
              
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes or comments about this document..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {document.uploadedBy && `Uploaded by ${document.uploadedBy}`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}