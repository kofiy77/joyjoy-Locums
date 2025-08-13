import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

interface SimpleDocumentUploadProps {
  entityType: 'staff' | 'care_home' | 'admin';
  entityId: string;
  onUploadComplete?: (document: any) => void;
  compact?: boolean;
}

interface UploadingFile {
  file: File;
  title: string;
  documentType: string;
  issueDate?: string;
  expiryDate?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

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

export function SimpleDocumentUpload({ 
  entityType, 
  entityId, 
  onUploadComplete,
  compact = false 
}: SimpleDocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch existing documents
  const { data: existingDocuments = [], refetch: refetchDocuments } = useQuery({
    queryKey: [`/api/documents/${entityType}/${entityId}`],
    queryFn: async () => {
      const response = await apiRequest(`/api/documents/${entityType}/${entityId}`);
      return await response.json();
    }
  });

  // Fetch available categories with fallback
  const { data: categoriesData, isError: categoriesError } = useQuery({
    queryKey: [`/api/documents/categories/${entityType}`],
    queryFn: async () => {
      const response = await apiRequest(`/api/documents/categories/${entityType}`);
      return await response.json();
    }
  });

  // Ensure categories is always an array with fallback data
  const categories = Array.isArray(categoriesData) ? categoriesData : 
    entityType === 'care_home' ? [
      'CQC Registration', 'Insurance Documents', 'Safety Certificates',
      'Policies & Procedures', 'Staff Contracts', 'Compliance Reports',
      'Financial Documents', 'Inspection Reports', 'Service Agreements',
      'Rate Schedules', 'SLA Documents'
    ] : entityType === 'staff' ? [
      'Identity Documents', 'DBS Check', 'Right to Work', 'CV/Resume',
      'Qualifications', 'Training Certificates', 'References', 
      'Medical Clearance', 'Emergency Contacts'
    ] : [
      'Invoices', 'Reports', 'Contracts', 'Legal Documents',
      'System Documentation', 'Audit Reports', 'Feedback Forms'
    ];

  const uploadMutation = useMutation({
    mutationFn: async (uploadData: UploadingFile) => {
      // Validate that a file exists
      if (!uploadData.file) {
        throw new Error('No file selected for upload');
      }
      
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);
      formData.append('documentType', uploadData.documentType);
      formData.append('title', uploadData.title);
      
      // Add issue date and expiry date if they exist
      if (uploadData.issueDate) {
        formData.append('issueDate', uploadData.issueDate);
      }
      if (uploadData.expiryDate) {
        formData.append('expiryDate', uploadData.expiryDate);
      }

      console.log('📄 Starting document upload:', {
        fileName: uploadData.file.name,
        fileSize: uploadData.file.size,
        title: uploadData.title,
        documentType: uploadData.documentType
      });

      // Use apiRequest for proper JWT authentication
      const response = await apiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      // Parse the response as JSON
      return await response.json();
    },
    onSuccess: (result, uploadData) => {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.file === uploadData.file 
            ? { ...f, status: 'success', progress: 100, result }
            : f
        )
      );
      
      // Refresh documents list
      refetchDocuments();
      
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

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentPath: string) => {
      return apiRequest(`/api/documents/${entityType}/${encodeURIComponent(documentPath)}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      refetchDocuments();
      toast({
        title: "Document Deleted",
        description: "Document has been successfully deleted."
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const selectedFiles = Array.from(files);
    const newUploadingFiles: UploadingFile[] = selectedFiles.map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      documentType: categories[0] || 'General',
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

  const handleUploadFile = (uploadData: UploadingFile) => {
    updateFileData(uploadData.file, { status: 'uploading', progress: 0 });
    uploadMutation.mutate(uploadData);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
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

        {/* Existing Documents */}
        {existingDocuments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Existing Documents</h4>
            {existingDocuments.map((doc: any, index: number) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                {getFileIcon(doc.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.publicUrl, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteDocumentMutation.mutate(doc.storagePath)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Queue */}
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
                  <Button size="sm" onClick={() => handleUploadFile(uploadFile)}>
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
          Document Management
        </CardTitle>
        <CardDescription>
          Upload and manage documents for {entityType === 'care_home' ? 'care home' : entityType} records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Zone */}
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
            Supports PDF, DOC, DOCX, JPG, PNG, CSV files up to 50MB
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

        {/* Existing Documents */}
        {existingDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Existing Documents</h3>
            <div className="grid gap-3">
              {existingDocuments.map((doc: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getFileIcon(doc.mimeType)}
                  <div className="flex-1">
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.publicUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocumentMutation.mutate(doc.storagePath)}
                      disabled={deleteDocumentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Queue */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload Queue</h3>
            {uploadingFiles.map((uploadFile, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
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

                  {uploadFile.status === 'uploading' && (
                    <div className="space-y-2">
                      <Progress value={uploadFile.progress} />
                      <p className="text-sm text-gray-600 text-center">
                        Uploading... {uploadFile.progress}%
                      </p>
                    </div>
                  )}

                  {uploadFile.status === 'error' && uploadFile.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-600">{uploadFile.error}</p>
                    </div>
                  )}

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
                            {categories.map((category: string) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          onClick={() => handleUploadFile(uploadFile)}
                          disabled={!uploadFile.title}
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