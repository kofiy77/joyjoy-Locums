import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, Upload, FileText, X, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';

// Medical compliance document types for GPs and Nurse Practitioners
export const COMPLIANCE_DOCUMENT_TYPES = {
  dbs_check: {
    label: 'DBS Enhanced Check',
    description: 'Enhanced DBS certificate required for all clinical roles',
    icon: '🛡️',
    expiryWarning: 'DBS check expires within 3 months',
    requiresExpiry: true,
    validityPeriod: 36, // months
    mandatory: true
  },
  right_to_work: {
    label: 'Right to Work',
    description: 'Valid passport, birth certificate, or work permit',
    icon: '📋',
    expiryWarning: 'Document may have expiry requirements',
    requiresExpiry: false,
    validityPeriod: 0,
    mandatory: true
  },
  gmc_registration: {
    label: 'GMC Registration',
    description: 'General Medical Council registration certificate (for GPs)',
    icon: '⚕️',
    expiryWarning: 'GMC registration requires annual renewal',
    requiresExpiry: true,
    validityPeriod: 12, // months
    mandatory: true
  },
  nmc_registration: {
    label: 'NMC Registration',
    description: 'Nursing and Midwifery Council registration (for Nurse Practitioners)',
    icon: '🩺',
    expiryWarning: 'NMC registration requires annual renewal',
    requiresExpiry: true,
    validityPeriod: 12, // months
    mandatory: true
  },
  medical_indemnity: {
    label: 'Medical Indemnity Insurance',
    description: 'Professional indemnity insurance cover (MDU/MPS/MDDUS)',
    icon: '🛡️',
    expiryWarning: 'Insurance expires within 3 months',
    requiresExpiry: true,
    validityPeriod: 12, // months
    mandatory: true
  },
  basic_life_support: {
    label: 'Basic Life Support (BLS)',
    description: 'Current BLS certification from approved provider',
    icon: '🫀',
    expiryWarning: 'BLS certification expires within 3 months',
    requiresExpiry: true,
    validityPeriod: 12, // months
    mandatory: true
  },
  safeguarding_children: {
    label: 'Safeguarding Children Training',
    description: 'Level 3 safeguarding children training certificate',
    icon: '👶',
    expiryWarning: 'Safeguarding training expires within 3 months',
    requiresExpiry: true,
    validityPeriod: 36, // months
    mandatory: true
  },
  safeguarding_adults: {
    label: 'Safeguarding Adults Training',
    description: 'Adult safeguarding awareness certificate',
    icon: '🔒',
    expiryWarning: 'Training expires within 3 months',
    requiresExpiry: true,
    validityPeriod: 36, // months
    mandatory: true
  },
  infection_control: {
    label: 'Infection Prevention & Control',
    description: 'IPC training for healthcare settings',
    icon: '🧼',
    expiryWarning: 'Training expires within 3 months',
    requiresExpiry: true,
    validityPeriod: 12, // months
    mandatory: true
  },
  medical_degree: {
    label: 'Medical Degree Certificate',
    description: 'MBBS/MBChB or equivalent medical qualification',
    icon: '🎓',
    expiryWarning: 'Provide original degree certificate',
    requiresExpiry: false,
    validityPeriod: 0,
    mandatory: true
  },
  nursing_degree: {
    label: 'Nursing Degree/Diploma',
    description: 'BSc Nursing, Diploma, or equivalent nursing qualification',
    icon: '🎓',
    expiryWarning: 'Provide original nursing qualification',
    requiresExpiry: false,
    validityPeriod: 0,
    mandatory: true
  },
  prescribing_qualification: {
    label: 'Independent Prescribing Qualification',
    description: 'V300 or equivalent prescribing qualification (for Nurse Practitioners)',
    icon: '💊',
    expiryWarning: 'Prescribing qualification verification required',
    requiresExpiry: false,
    validityPeriod: 0,
    mandatory: false
  },
  clinical_references: {
    label: 'Clinical References',
    description: 'Two clinical references from medical supervisors or consultants',
    icon: '📝',
    expiryWarning: 'References should be recent (within 2 years)',
    requiresExpiry: false,
    validityPeriod: 0,
    mandatory: true
  },
  medical_cv: {
    label: 'Medical CV',
    description: 'Current medical curriculum vitae with clinical experience',
    icon: '📄',
    expiryWarning: 'CV should include recent clinical roles',
    requiresExpiry: false,
    validityPeriod: 0,
    mandatory: true
  },
  occupational_health: {
    label: 'Occupational Health Clearance',
    description: 'Occupational health clearance including immunization status',
    icon: '💉',
    expiryWarning: 'OH clearance expires within 6 months',
    requiresExpiry: true,
    validityPeriod: 12, // months
    mandatory: true
  }
};

const uploadSchema = z.object({
  issueDate: z.date({
    required_error: 'Issue date is required'
  }),
  expiryDate: z.date().optional(),
  file: z.instanceof(File, {
    message: 'Please select a valid file'
  }),
  // DBS-specific fields
  dbsUpdateService: z.enum(['yes', 'no']).optional(),
  dbsCertificateNumber: z.string().optional(),
  dbsUpdateServiceId: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface ComplianceUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: keyof typeof COMPLIANCE_DOCUMENT_TYPES;
  existingDocument?: {
    id: string;
    title: string;
    filename?: string;
    issueDate?: string;
    expiryDate?: string;
    status: 'pending' | 'approved' | 'rejected';
    verificationStatus: 'pending' | 'verified' | 'rejected';
  } | null;
  onUploadComplete?: () => void;
}

export default function ComplianceUploadDialog({
  isOpen,
  onClose,
  documentType,
  existingDocument,
  onUploadComplete
}: ComplianceUploadDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const docConfig = COMPLIANCE_DOCUMENT_TYPES[documentType];
  const isUpdating = !!existingDocument;

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      issueDate: existingDocument?.issueDate ? new Date(existingDocument.issueDate) : undefined,
      expiryDate: existingDocument?.expiryDate ? new Date(existingDocument.expiryDate) : undefined,
      dbsUpdateService: 'no',
      dbsCertificateNumber: '',
      dbsUpdateServiceId: '',
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!selectedFile && !existingDocument) {
        throw new Error('Please select a file to upload');
      }

      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      formData.append('entityType', 'staff');
      formData.append('entityId', user?.id || '');
      formData.append('documentType', documentType);
      formData.append('title', docConfig.label);
      formData.append('category', docConfig.mandatory ? 'mandatory' : 'supplementary');
      
      if (data.issueDate) {
        formData.append('issueDate', format(data.issueDate, 'yyyy-MM-dd'));
      }
      
      if (data.expiryDate) {
        formData.append('expiryDate', format(data.expiryDate, 'yyyy-MM-dd'));
      }

      // Add DBS-specific fields if this is a DBS document
      if (documentType === 'dbs_check') {
        if (data.dbsUpdateService) {
          formData.append('dbsUpdateService', data.dbsUpdateService);
        }
        if (data.dbsCertificateNumber) {
          formData.append('dbsCertificateNumber', data.dbsCertificateNumber);
        }
        if (data.dbsUpdateServiceId) {
          formData.append('dbsUpdateServiceId', data.dbsUpdateServiceId);
        }
      }

      const endpoint = isUpdating 
        ? `/api/documents/staff/${user?.id}/${documentType}`
        : '/api/documents/upload';
        
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await apiRequest(endpoint, {
        method,
        body: formData
      });

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: isUpdating ? "Document Updated" : "Document Uploaded",
        description: `Your ${docConfig.label} has been ${isUpdating ? 'updated' : 'uploaded'} successfully.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
      
      onUploadComplete?.();
      onClose();
      
      // Reset form
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "There was an error uploading your document.",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, Word document, or image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    form.setValue('file', file);
    form.clearErrors('file');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onSubmit = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.setValue('file', undefined as any);
  };

  const viewExistingDocument = async () => {
    if (existingDocument) {
      // Open document viewer
      window.open(`/api/documents/view/staff/${user?.id}/${documentType}`, '_blank');
    }
  };

  const calculateExpiryWarning = (issueDate: Date) => {
    if (!docConfig.requiresExpiry || !docConfig.validityPeriod) return null;
    
    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + docConfig.validityPeriod);
    
    const today = new Date();
    const monthsUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (monthsUntilExpiry <= 3) {
      return `This document will expire on ${format(expiryDate, 'PPP')}`;
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{docConfig.icon}</span>
            <div>
              <div className="text-lg">Compliance</div>
              <div className="text-sm text-gray-600 font-normal">
                Please upload the following mandatory credentials based on your location in England.
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Upload your {docConfig.label.toLowerCase()} document and provide the relevant dates for compliance verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">{docConfig.label}</h3>
                  {docConfig.mandatory && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{docConfig.description}</p>
                
                {existingDocument && (
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={existingDocument.status === 'approved' ? 'default' : 
                              existingDocument.status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      Status: {existingDocument.status}
                    </Badge>
                    
                    {existingDocument.expiryDate && (
                      <span className="text-xs text-amber-600">
                        Document expires within 3 months
                      </span>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={viewExistingDocument}
                      className="h-8"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View File
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                {existingDocument?.status === 'approved' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                )}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Issue Date */}
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Issue Date
                    </FormLabel>
                    <div className="text-sm text-gray-600 mb-2">
                      Enter the date when this credential is valid from.
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-12",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "25th Aug 2024"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiry Date */}
              {docConfig.requiresExpiry && (
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Expiry Date
                      </FormLabel>
                      <div className="text-sm text-gray-600 mb-2">
                        We can help ensure your credentials are always in date through our reminder service.
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal h-12",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "31st Aug 2025"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* DBS-specific fields - only show for DBS Enhanced Check documents */}
              {documentType === 'dbs_check' && (
                <>
                  {/* DBS Update Service */}
                  <FormField
                    control={form.control}
                    name="dbsUpdateService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Are you on the DBS Update Service?
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Yes" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DBS Certificate Number */}
                  <FormField
                    control={form.control}
                    name="dbsCertificateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          DBS Certificate Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="001796629651"
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DBS Update Service ID */}
                  <FormField
                    control={form.control}
                    name="dbsUpdateServiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          DBS Update Service ID
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="C2208142657"
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Upload Credential</Label>
                <div className="text-sm text-gray-600">
                  Select any valid file or image format.
                </div>

                {/* File Drop Zone */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
                    "hover:border-gray-400"
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-green-600">Selected File</div>
                      <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{selectedFile.name}</div>
                          <div className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="h-8"
                      >
                        Change File
                      </Button>
                    </div>
                  ) : existingDocument ? (
                    <div className="space-y-4">
                      <FileText className="h-12 w-12 text-blue-600 mx-auto" />
                      <div className="text-sm font-medium">Current Document</div>
                      <div className="text-xs text-gray-500">{existingDocument?.filename || existingDocument?.title || 'Document uploaded'}</div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="h-8"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div className="text-sm font-medium">Drop files here or click to upload</div>
                      <div className="text-xs text-gray-500">PDF, Word, or image files up to 10MB</div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="h-8"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Warning for expiry */}
              {form.watch('issueDate') && calculateExpiryWarning(form.watch('issueDate')) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {calculateExpiryWarning(form.watch('issueDate'))}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submission Agreement */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  By Submitting this information, you are confirming that all the information 
                  supplied is accurate and you can provide physical evidence relating to this 
                  should you be required to in future.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={uploadMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Saving...' : 'Save Credential'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}