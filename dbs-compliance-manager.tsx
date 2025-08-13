import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Upload,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// DBS Compliance form schema matching the reference image
const dbsComplianceSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  dbsCertificateNumber: z.string().min(1, 'DBS certificate number is required'),
  dbsUpdateServiceId: z.string().optional(),
  isOnUpdateService: z.boolean().default(false),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  checkLevel: z.enum(['basic', 'standard', 'enhanced', 'enhanced_with_barred_lists']).default('enhanced'),
  workforceType: z.enum(['adult', 'child', 'both']).default('adult'),
  requestedBy: z.string().optional(),
  notes: z.string().optional(),
  document: z.any().optional()
});

type DbsComplianceFormData = z.infer<typeof dbsComplianceSchema>;

interface DbsComplianceRecord {
  id: string;
  staffId: string;
  staffName: string;
  dbsCertificateNumber: string;
  dbsUpdateServiceId?: string;
  isOnUpdateService: boolean;
  issueDate: string;
  expiryDate: string;
  checkLevel: string;
  workforceType: string;
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  requestedBy?: string;
  notes?: string;
  documentUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DbsComplianceManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DbsComplianceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch staff list for dropdown
  const { data: staffList = [] } = useQuery({
    queryKey: ['/api/staff'],
    select: (data) => Array.isArray(data) ? data : []
  });

  // Fetch DBS compliance records
  const { data: dbsRecords = [], isLoading, error } = useQuery({
    queryKey: ['/api/dbs-compliance'],
    select: (data) => Array.isArray(data) ? data : []
  });

  // Form setup
  const form = useForm<DbsComplianceFormData>({
    resolver: zodResolver(dbsComplianceSchema),
    defaultValues: {
      staffId: '',
      dbsCertificateNumber: '',
      dbsUpdateServiceId: '',
      isOnUpdateService: false,
      issueDate: '',
      expiryDate: '',
      checkLevel: 'enhanced',
      workforceType: 'adult',
      requestedBy: '',
      notes: ''
    }
  });

  // Create/Update DBS compliance record mutation
  const createDbsMutation = useMutation({
    mutationFn: async (data: DbsComplianceFormData) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'document') {
          formData.append(key, String(value));
        }
      });

      // Append file if selected
      if (selectedFile) {
        formData.append('document', selectedFile);
      }

      const response = await fetch('/api/dbs-compliance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create DBS compliance record');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'DBS compliance record created successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dbs-compliance'] });
      setIsDialogOpen(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create DBS compliance record',
        variant: 'destructive'
      });
    }
  });

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      return apiRequest(`/api/dbs-compliance/${id}/verify`, {
        method: 'PUT',
        body: { verificationStatus: status, rejectionReason: reason }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Verification status updated successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dbs-compliance'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update verification status',
        variant: 'destructive'
      });
    }
  });

  // Delete DBS record mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/dbs-compliance/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'DBS compliance record deleted successfully'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dbs-compliance'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete DBS compliance record',
        variant: 'destructive'
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: DbsComplianceFormData) => {
    createDbsMutation.mutate(data);
  };

  // File selection handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF or image file',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive'
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  // Filter records based on search term and status
  const filteredRecords = dbsRecords.filter((record) => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.dbsCertificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  // Check if record is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  // Download document handler
  const handleDownloadDocument = async (recordId: string) => {
    try {
      const response = await fetch(`/api/dbs-compliance/${recordId}/document`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Get the filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : 'dbs-document.pdf';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Document downloaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-700">
            <h3 className="font-medium mb-2">Unable to load DBS compliance records</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">DBS Compliance Management</h2>
          <p className="text-gray-600">Manage staff DBS certificates and verification status</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add DBS Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add DBS Compliance Record</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Staff Selection */}
              <div>
                <Label htmlFor="staffId">Staff Member *</Label>
                <Select onValueChange={(value) => form.setValue('staffId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((staff: any) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName} - {staff.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.staffId && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.staffId.message}</p>
                )}
              </div>

              {/* DBS Certificate Number */}
              <div>
                <Label htmlFor="dbsCertificateNumber">DBS Certificate Number *</Label>
                <Input
                  id="dbsCertificateNumber"
                  {...form.register('dbsCertificateNumber')}
                  placeholder="e.g., 001234567890"
                />
                {form.formState.errors.dbsCertificateNumber && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.dbsCertificateNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Issue Date */}
                <div>
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    {...form.register('issueDate')}
                  />
                  {form.formState.errors.issueDate && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.issueDate.message}</p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...form.register('expiryDate')}
                  />
                  {form.formState.errors.expiryDate && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.expiryDate.message}</p>
                  )}
                </div>
              </div>

              {/* Check Level */}
              <div>
                <Label htmlFor="checkLevel">Check Level</Label>
                <Select onValueChange={(value) => form.setValue('checkLevel', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select check level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="enhanced">Enhanced</SelectItem>
                    <SelectItem value="enhanced_with_barred_lists">Enhanced with Barred Lists</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Workforce Type */}
              <div>
                <Label htmlFor="workforceType">Workforce Type</Label>
                <Select onValueChange={(value) => form.setValue('workforceType', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workforce type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adult Workforce</SelectItem>
                    <SelectItem value="child">Child Workforce</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* DBS Update Service */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isOnUpdateService"
                    onCheckedChange={(checked) => form.setValue('isOnUpdateService', Boolean(checked))}
                  />
                  <Label htmlFor="isOnUpdateService">Registered on DBS Update Service</Label>
                </div>
                
                {form.watch('isOnUpdateService') && (
                  <div>
                    <Label htmlFor="dbsUpdateServiceId">DBS Update Service ID</Label>
                    <Input
                      id="dbsUpdateServiceId"
                      {...form.register('dbsUpdateServiceId')}
                      placeholder="Enter Update Service ID"
                    />
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <Label htmlFor="document">DBS Certificate Document</Label>
                <div className="mt-1">
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload PDF or image file (max 10MB)
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Requested By */}
              <div>
                <Label htmlFor="requestedBy">Requested By</Label>
                <Input
                  id="requestedBy"
                  {...form.register('requestedBy')}
                  placeholder="e.g., HR Manager, Line Manager"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Additional notes or comments..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDbsMutation.isPending}>
                  {createDbsMutation.isPending ? 'Creating...' : 'Create Record'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by staff name or certificate number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{dbsRecords.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {dbsRecords.filter(r => r.verificationStatus === 'verified').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dbsRecords.filter(r => r.verificationStatus === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-red-600">
                  {dbsRecords.filter(r => isExpiringSoon(r.expiryDate)).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>DBS Compliance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading DBS records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No DBS records found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first DBS compliance record to get started'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Certificate Number</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Check Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.staffName}</p>
                          {record.isOnUpdateService && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Update Service
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {record.dbsCertificateNumber}
                      </TableCell>
                      <TableCell>
                        {new Date(record.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          {new Date(record.expiryDate).toLocaleDateString()}
                          {isExpiringSoon(record.expiryDate) && (
                            <Badge variant="outline" className="ml-2 text-xs text-red-600 border-red-200">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {record.checkLevel.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.verificationStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.documentUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(record.id)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {record.verificationStatus === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateVerificationMutation.mutate({ 
                                  id: record.id, 
                                  status: 'verified' 
                                })}
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateVerificationMutation.mutate({ 
                                  id: record.id, 
                                  status: 'rejected',
                                  reason: 'Manual rejection' 
                                })}
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(record.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}