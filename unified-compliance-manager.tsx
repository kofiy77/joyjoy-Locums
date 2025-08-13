import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Calendar, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Plus,
  Shield,
  Heart,
  FileCheck,
  GraduationCap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Schema for general compliance form
const complianceFormSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  type: z.string().min(1, 'Compliance type is required'),
  title: z.string().min(1, 'Title is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  requiredBy: z.string().optional(),
  isRequired: z.boolean().default(true),
  isMandatory: z.boolean().default(false),
  complianceCategory: z.enum(['legal_safety', 'insurance_protection', 'clinical_training', 'supplementary']).optional(),
  reminderService: z.boolean().default(true),
  document: z.any().optional()
});

type ComplianceFormData = z.infer<typeof complianceFormSchema>;

// Medical compliance types matching the image
const MEDICAL_COMPLIANCE_TYPES = [
  {
    type: 'dbs_enhanced_check',
    title: 'DBS Enhanced Check',
    category: 'legal_safety',
    icon: Shield,
    required: true,
    mandatory: true,
    description: 'Enhanced DBS certificate required for all clinical roles'
  },
  {
    type: 'right_to_work',
    title: 'Right to Work',
    category: 'legal_safety',
    icon: FileCheck,
    required: true,
    mandatory: true,
    description: 'Valid passport, birth certificate, or work permit'
  },
  {
    type: 'medical_indemnity_insurance',
    title: 'Medical Indemnity Insurance',
    category: 'insurance_protection',
    icon: Heart,
    required: true,
    mandatory: true,
    description: 'Professional indemnity insurance cover (MDU/MPS/MDDUS)'
  },
  {
    type: 'discharge_medicine_service',
    title: 'Discharge Medicine Service (DMS)',
    category: 'clinical_training',
    icon: GraduationCap,
    required: false,
    mandatory: false,
    description: 'Optional training for discharge medicine services'
  },
  {
    type: 'gmc_registration',
    title: 'GMC Registration',
    category: 'legal_safety',
    icon: FileCheck,
    required: true,
    mandatory: true,
    description: 'Valid General Medical Council registration'
  },
  {
    type: 'nmc_registration',
    title: 'NMC Registration',
    category: 'legal_safety',
    icon: FileCheck,
    required: true,
    mandatory: true,
    description: 'Valid Nursing and Midwifery Council registration'
  }
];

const UnifiedComplianceManager: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceFormSchema),
    defaultValues: {
      staffId: '',
      type: '',
      title: '',
      issueDate: '',
      expiryDate: '',
      requiredBy: 'JoyJoy Locums',
      isRequired: true,
      isMandatory: false,
      complianceCategory: 'legal_safety',
      reminderService: true
    }
  });

  // Fetch staff list
  const { data: staffList } = useQuery({
    queryKey: ['/api/admin/staff'],
    enabled: isAddDialogOpen
  });

  // Fetch compliance records
  const { data: complianceRecords, isLoading } = useQuery({
    queryKey: ['/api/compliance/records']
  });

  // Fetch DBS compliance records
  const { data: dbsRecords } = useQuery({
    queryKey: ['/api/dbs-compliance']
  });

  // Create compliance record mutation
  const createComplianceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('/api/compliance/records', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Compliance record created successfully'
      });
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/compliance/records'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create compliance record',
        variant: 'destructive'
      });
      console.error('Error creating compliance record:', error);
    }
  });

  // Calculate compliance statistics
  const complianceStats = useMemo(() => {
    const complianceArray = Array.isArray(complianceRecords) ? complianceRecords : [];
    const dbsArray = Array.isArray(dbsRecords) ? dbsRecords : [];
    const allRecords = [...complianceArray, ...dbsArray];
    const totalStaff = Array.isArray(staffList) ? staffList.length : 0;
    
    const mandatoryCompleted = allRecords.filter(record => 
      record.isMandatory && record.verificationStatus === 'verified'
    ).length;
    
    const totalMandatory = MEDICAL_COMPLIANCE_TYPES.filter(type => type.mandatory).length * totalStaff;
    
    const pendingDocuments = allRecords.filter(record => 
      record.verificationStatus === 'evidence_not_provided' || record.verificationStatus === 'pending'
    ).length;
    
    const expiringSoon = allRecords.filter(record => {
      if (!record.expiryDate) return false;
      const expiryDate = new Date(record.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;

    return {
      totalStaff,
      mandatoryCompleted,
      totalMandatory,
      complianceRate: totalMandatory > 0 ? Math.round((mandatoryCompleted / totalMandatory) * 100) : 0,
      pendingDocuments,
      expiringSoon
    };
  }, [complianceRecords, dbsRecords, staffList]);

  const onSubmit = async (data: ComplianceFormData) => {
    try {
      const formData = new FormData();
      
      // Append form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'document' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Append document if provided
      if (data.document && data.document[0]) {
        formData.append('document', data.document[0]);
      }
      
      await createComplianceMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medical Compliance & Documents</h2>
          <p className="text-gray-600 mt-1">Manage medical professional compliance requirements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Compliance Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Compliance Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Member</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select staff member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(staffList) && staffList.map((staff: any) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.firstName} {staff.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compliance Type</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          const selectedType = MEDICAL_COMPLIANCE_TYPES.find(t => t.type === value);
                          if (selectedType) {
                            form.setValue('title', selectedType.title);
                            form.setValue('complianceCategory', selectedType.category as 'legal_safety' | 'insurance_protection' | 'clinical_training' | 'supplementary');
                            form.setValue('isRequired', selectedType.required);
                            form.setValue('isMandatory', selectedType.mandatory);
                          }
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select compliance type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MEDICAL_COMPLIANCE_TYPES.map((type) => (
                              <SelectItem key={type.type} value={type.type}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.title}
                                  {type.mandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Discharge Medicine Service (DMS)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            placeholder="Enter the date when this credential is valid from"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            placeholder="We can help ensure your credentials are always in date through our reminder service"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requiredBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required by</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., JoyJoy Locums" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Credential <span className="text-gray-500">(Optional)</span></FormLabel>
                      <FormControl>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Choose From Folder</p>
                          <p className="text-xs text-gray-500">Select any valid file or image format</p>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => field.onChange(e.target.files)}
                            className="mt-2"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    By submitting this information, you are confirming that all the information 
                    supplied is accurate and you can provide physical evidence relating to this 
                    should you be required to in future.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createComplianceMutation.isPending}
                    className="bg-teal-500 hover:bg-teal-600"
                  >
                    Save Credential
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">of {complianceStats.totalMandatory} mandatory</p>
                <p className="text-2xl font-bold text-blue-700">{complianceStats.mandatoryCompleted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">compliance rate</p>
                <p className="text-2xl font-bold text-green-700">{complianceStats.complianceRate}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">supplementary docs</p>
                <p className="text-2xl font-bold text-purple-700">{complianceStats.pendingDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">expiring soon</p>
                <p className="text-2xl font-bold text-orange-700">{complianceStats.expiringSoon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mandatory">Mandatory Documents</TabsTrigger>
          <TabsTrigger value="insurance">Insurance & Protection</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Medical Professional Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MEDICAL_COMPLIANCE_TYPES.map((type) => {
                  const Icon = type.icon;
                  const recordCount = Array.isArray(complianceRecords) ? 
                    complianceRecords.filter((r: any) => r.type === type.type).length : 0;
                  
                  return (
                    <div key={type.type} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-gray-600" />
                        <div>
                          <h3 className="font-medium">{type.title}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={type.mandatory ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {type.mandatory ? "Required" : "Optional"}
                        </Badge>
                        <Badge variant="outline">{recordCount} completed</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mandatory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Mandatory Medical Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {complianceStats.mandatoryCompleted} of {complianceStats.totalMandatory} documents completed
              </p>
              <div className="space-y-3">
                {MEDICAL_COMPLIANCE_TYPES.filter(type => type.mandatory).map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.type} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-red-900">{type.title}</h4>
                          <p className="text-sm text-red-700">{type.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                        Not Uploaded
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                Insurance & Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MEDICAL_COMPLIANCE_TYPES.filter(type => type.category === 'insurance_protection').map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.type} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-900">{type.title}</h4>
                          <p className="text-sm text-blue-700">{type.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        Not Uploaded
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                Clinical Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MEDICAL_COMPLIANCE_TYPES.filter(type => type.category === 'clinical_training').map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.type} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-purple-900">{type.title}</h4>
                          <p className="text-sm text-purple-700">{type.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                        Optional
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedComplianceManager;