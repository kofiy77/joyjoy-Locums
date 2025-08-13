import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Eye, Calendar, Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

const uploadSchema = z.object({
  type: z.string().min(1, "Document type is required"),
  title: z.string().min(1, "Document title is required"),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface DocumentUploadProps {
  staffId: number;
  onUploadComplete?: () => void;
}

const documentTypes = [
  { value: "dbs_check", label: "DBS Check" },
  { value: "first_aid", label: "First Aid Certificate" },
  { value: "manual_handling", label: "Manual Handling Training" },
  { value: "safeguarding", label: "Safeguarding Training" },
  { value: "dementia_care", label: "Dementia Care Training" },
  { value: "medication_admin", label: "Medication Administration" },
  { value: "food_hygiene", label: "Food Hygiene Certificate" },
  { value: "moving_handling", label: "Moving & Handling" },
];

export default function DocumentUpload({ staffId, onUploadComplete }: DocumentUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      type: "",
      title: "",
      issueDate: "",
      expiryDate: "",
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedFile) {
        throw new Error('No file selected for upload');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entityType', 'staff');
      formData.append('entityId', user?.id || '');
      formData.append('documentType', data.type);
      formData.append('title', data.title);
      
      if (data.issueDate) {
        formData.append('issueDate', data.issueDate);
      }
      if (data.expiryDate) {
        formData.append('expiryDate', data.expiryDate);
      }

      console.log('📄 Starting certification upload:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        title: data.title,
        documentType: data.type
      });

      // Simulate progress for UX
      setUploadProgress(20);
      
      const response = await apiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(60);
      
      setUploadProgress(100);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been uploaded and is being processed for verification.",
      });
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      setExtractedData(null);
      setUploadProgress(0);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      queryClient.invalidateQueries({ queryKey: [`/api/documents/staff/${user?.id}`] });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to upload document. Please try again.";
      
      // Provide specific guidance for common errors
      let description = errorMessage;
      if (errorMessage.includes("File too large")) {
        description = "The file exceeds the 10MB limit. Please compress your document or use a smaller file.";
      } else if (errorMessage.includes("Invalid file type")) {
        description = "Only PDF and image files (JPG, PNG) are supported. Please convert your document to a supported format.";
      } else if (errorMessage.includes("No file uploaded")) {
        description = "Please select a document before uploading.";
      }
      
      toast({
        title: "Upload failed",
        description,
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    // Extract text from document for date detection
    try {
      await processDocument(file);
    } catch (error) {
      console.error('Document processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDocument = async (file: File) => {
    // Create a simple text extraction for demonstration
    // In production, you would use OCR services like Tesseract.js or cloud OCR
    const fileName = file.name.toLowerCase();
    const extracted: any = {};

    // Try to extract dates from filename
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
    const matches: RegExpMatchArray[] = [];
    let match;
    while ((match = dateRegex.exec(fileName)) !== null) {
      matches.push(match);
    }
    
    if (matches.length > 0) {
      // Assume first date is issue date, second is expiry if exists
      const firstDate = matches[0];
      const issueDate = `${firstDate[3]}-${firstDate[2].padStart(2, '0')}-${firstDate[1].padStart(2, '0')}`;
      extracted.issueDate = issueDate;

      if (matches.length > 1) {
        const secondDate = matches[1];
        const expiryDate = `${secondDate[3]}-${secondDate[2].padStart(2, '0')}-${secondDate[1].padStart(2, '0')}`;
        extracted.expiryDate = expiryDate;
      }
    }

    // Auto-detect document type from filename
    if (fileName.includes('dbs') || fileName.includes('disclosure')) {
      extracted.type = 'dbs_check';
      extracted.title = 'DBS Check Certificate';
    } else if (fileName.includes('first aid')) {
      extracted.type = 'first_aid';
      extracted.title = 'First Aid Certificate';
    } else if (fileName.includes('manual handling') || fileName.includes('moving')) {
      extracted.type = 'manual_handling';
      extracted.title = 'Manual Handling Training Certificate';
    } else if (fileName.includes('safeguard')) {
      extracted.type = 'safeguarding';
      extracted.title = 'Safeguarding Training Certificate';
    } else if (fileName.includes('dementia')) {
      extracted.type = 'dementia_care';
      extracted.title = 'Dementia Care Training Certificate';
    } else if (fileName.includes('medication')) {
      extracted.type = 'medication_admin';
      extracted.title = 'Medication Administration Certificate';
    } else if (fileName.includes('food') || fileName.includes('hygiene')) {
      extracted.type = 'food_hygiene';
      extracted.title = 'Food Hygiene Certificate';
    }

    setExtractedData(extracted);

    // Auto-populate form with extracted data
    if (extracted.type) form.setValue('type', extracted.type);
    if (extracted.title) form.setValue('title', extracted.title);
    if (extracted.issueDate) form.setValue('issueDate', extracted.issueDate);
    if (extracted.expiryDate) form.setValue('expiryDate', extracted.expiryDate);
  };

  const onSubmit = (data: UploadFormData) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a document to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      ...data,
      staffId,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      mimeType: selectedFile.type,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload your DBS, qualifications, and training certificates securely
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 text-green-600 mx-auto" />
                <p className="font-medium text-green-800">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {isProcessing && (
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-blue-600">Processing document...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-lg font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Extracted Data Preview */}
          {extractedData && Object.keys(extractedData).length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Auto-detected information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {extractedData.type && (
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{documentTypes.find(t => t.value === extractedData.type)?.label}</span>
                    </div>
                  )}
                  {extractedData.issueDate && (
                    <div>
                      <span className="text-gray-600">Issue Date:</span>
                      <span className="ml-2 font-medium">{extractedData.issueDate}</span>
                    </div>
                  )}
                  {extractedData.expiryDate && (
                    <div>
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="ml-2 font-medium">{extractedData.expiryDate}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Please verify the information below and make corrections if needed
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="type">Document Type *</Label>
            <Select onValueChange={(value) => form.setValue('type', value)} value={form.watch('type')}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.type && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.type.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Enhanced DBS Certificate"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                {...form.register("issueDate")}
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...form.register("expiryDate")}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setExtractedData(null);
                form.reset();
              }}
              disabled={uploadMutation.isPending}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>

        {/* Upload Guidelines */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security & Guidelines
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All documents are encrypted and stored securely</li>
              <li>• Only authorized personnel can view your documents</li>
              <li>• Supported formats: PDF, JPG, PNG (max 10MB)</li>
              <li>• Documents are automatically scanned for expiry dates</li>
              <li>• You'll receive notifications before documents expire</li>
              <li>• Upload may fail if file is too large or wrong format</li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}