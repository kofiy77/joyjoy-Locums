import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Trash2
} from "lucide-react";

interface DocumentUploadProps {
  entityType: 'staff' | 'care_home' | 'admin';
  entityId: string;
  allowedCategories?: string[];
  onUploadComplete?: (document: any) => void;
  maxFiles?: number;
  compact?: boolean;
}

interface UploadingFile {
  file: File;
  title: string;
  documentType: string;
  description: string;
  isConfidential: boolean;
  accessLevel: string;
  tags: string[];
  expiryDate: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

const DOCUMENT_CATEGORIES = {
  staff: [
    'passport', 'driving_license', 'national_id', 'visa',
    'degree', 'diploma', 'certificate', 'training_record',
    'dbs_check', 'right_to_work', 'references', 'medical_clearance',
    'cv', 'cover_letter', 'employment_history', 'contract',
    'photo', 'emergency_contacts', 'next_of_kin'
  ],
  care_home: [
    'cqc_certificate', 'registration_documents', 'license',
    'liability_insurance', 'professional_indemnity', 'property_insurance',
    'safeguarding_policy', 'health_safety_policy', 'gdpr_policy',
    'fire_safety_certificate', 'food_hygiene_certificate', 'risk_assessments',
    'service_agreements', 'supplier_contracts', 'staff_contracts',
    'accounts', 'audit_reports', 'tax_documents'
  ],
  admin: [
    'monthly_invoice', 'annual_statement', 'payment_receipt',
    'performance_report', 'compliance_report', 'incident_report',
    'care_home_feedback', 'staff_feedback', 'client_feedback',
    'backup_files', 'audit_logs', 'system_reports',
    'contracts', 'agreements', 'legal_notices'
  ]
};

const ACCESS_LEVELS = [
  { value: 'public', label: 'Public', description: 'Accessible to all users' },
  { value: 'internal', label: 'Internal', description: 'Organization members only' },
  { value: 'restricted', label: 'Restricted', description: 'Limited access group' },
  { value: 'confidential', label: 'Confidential', description: 'Highly restricted access' }
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
  if (mimeType.includes('pdf')) return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentUpload({ 
  entityType, 
  entityId, 
  allowedCategories,
  onUploadComplete,
  maxFiles = 10,
  compact = false 
}: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categories = allowedCategories || DOCUMENT_CATEGORIES[entityType] || [];

  const uploadMutation = useMutation({
    mutationFn: async (uploadData: UploadingFile) => {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('documentType', uploadData.documentType);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('isConfidential', uploadData.isConfidential.toString());
      formData.append('accessLevel', uploadData.accessLevel);
      formData.append('tags', JSON.stringify(uploadData.tags));
      if (uploadData.expiryDate) {
        formData.append('expiryDate', uploadData.expiryDate);
      }

      return apiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
    },
    onSuccess: (result, uploadData) => {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.file === uploadData.file 
            ? { ...f, status: 'success', progress: 100, result }
            : f
        )
      );
      
      // Invalidate documents cache
      queryClient.invalidateQueries({ 
        queryKey: [`/api/documents/${entityType}/${entityId}`] 
      });
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      toast({
        title: "Upload Successful",
        description: `${uploadData.title} has been uploaded successfully.`
      });
    },
    onError: (error: any, uploadData) => {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.file === uploadData.file 
            ? { ...f, status: 'error', error: error.message }
            : f
        )
      );
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    
    if (uploadingFiles.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const newUploadingFiles: UploadingFile[] = selectedFiles.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      documentType: categories[0] || 'document',
      description: '',
      isConfidential: false,
      accessLevel: 'internal',
      tags: [],
      expiryDate: '',
      progress: 0,
      status: 'pending'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  const updateFileData = (file: File, updates: Partial<UploadingFile>) => {
    setUploadingFiles(prev => 
      prev.map(f => f.file === file ? { ...f, ...updates } : f)
    );
  };

  const uploadFile = (uploadData: UploadingFile) => {
    updateFileData(uploadData.file, { status: 'uploading', progress: 0 });
    uploadMutation.mutate(uploadData);
  };

  const uploadAllPending = () => {
    const pendingFiles = uploadingFiles.filter(f => f.status === 'pending');
    pendingFiles.forEach(uploadFile);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Drop files here or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:underline"
            >
              browse
            </button>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
          />
        </div>

        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            {uploadingFiles.map((uploadFile, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                {getFileIcon(uploadFile.file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.title}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadFile.file.size)}</p>
                </div>
                {uploadFile.status === 'pending' && (
                  <Button size="sm" onClick={() => uploadFile(uploadFile)}>
                    Upload
                  </Button>
                )}
                {uploadFile.status === 'uploading' && (
                  <div className="w-16">
                    <Progress value={uploadFile.progress} className="h-2" />
                  </div>
                )}
                {uploadFile.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {uploadFile.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadFile.file)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload documents for {entityType === 'care_home' ? 'care home' : entityType} records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or browse
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Supports PDF, DOC, DOCX, JPG, PNG, CSV files up to 25MB
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
          />
        </div>

        {/* File List */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Files to Upload</h3>
              <Button
                onClick={uploadAllPending}
                disabled={!uploadingFiles.some(f => f.status === 'pending')}
              >
                Upload All
              </Button>
            </div>

            {uploadingFiles.map((uploadFile, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  {/* File Header */}
                  <div className="flex items-center gap-3">
                    {getFileIcon(uploadFile.file.type)}
                    <div className="flex-1">
                      <p className="font-medium">{uploadFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {uploadFile.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploadFile.status === 'uploading' && (
                    <div className="space-y-2">
                      <Progress value={uploadFile.progress} />
                      <p className="text-sm text-gray-600 text-center">
                        Uploading... {uploadFile.progress}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-600">{uploadFile.error}</p>
                    </div>
                  )}

                  {/* File Details Form */}
                  {uploadFile.status === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label htmlFor={`title-${index}`}>Document Title</Label>
                        <Input
                          id={`title-${index}`}
                          value={uploadFile.title}
                          onChange={(e) => updateFileData(uploadFile.file, { title: e.target.value })}
                          placeholder="Enter document title"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`category-${index}`}>Document Category</Label>
                        <Select
                          value={uploadFile.documentType}
                          onValueChange={(value) => updateFileData(uploadFile.file, { documentType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor={`description-${index}`}>Description (Optional)</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={uploadFile.description}
                          onChange={(e) => updateFileData(uploadFile.file, { description: e.target.value })}
                          placeholder="Enter document description"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`access-${index}`}>Access Level</Label>
                        <Select
                          value={uploadFile.accessLevel}
                          onValueChange={(value) => updateFileData(uploadFile.file, { accessLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCESS_LEVELS.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`expiry-${index}`}>Expiry Date (Optional)</Label>
                        <Input
                          id={`expiry-${index}`}
                          type="date"
                          value={uploadFile.expiryDate}
                          onChange={(e) => updateFileData(uploadFile.file, { expiryDate: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center space-x-2">
                        <Checkbox
                          id={`confidential-${index}`}
                          checked={uploadFile.isConfidential}
                          onCheckedChange={(checked) => 
                            updateFileData(uploadFile.file, { isConfidential: checked as boolean })
                          }
                        />
                        <Label htmlFor={`confidential-${index}`}>
                          Mark as confidential
                        </Label>
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          onClick={() => uploadFile(uploadFile)}
                          disabled={!uploadFile.title || !uploadFile.documentType}
                        >
                          Upload Document
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}