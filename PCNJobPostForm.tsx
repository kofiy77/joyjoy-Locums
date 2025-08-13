import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Building, Users, MapPin, Calendar, PoundSterling, Plus, X } from "lucide-react";

const jobPostSchema = z.object({
  pcnName: z.string().min(2, "PCN name must be at least 2 characters"),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonRole: z.string().min(2, "Contact person role must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  postcode: z.string().min(5, "Postcode must be at least 5 characters"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  jobRole: z.string().min(1, "Please select or enter a job role"),
  customJobRole: z.string().optional(),
  nhsBand: z.string().min(1, "Please select an NHS Band"),
  contractType: z.string().min(1, "Please select contract type"),
  hoursPerWeek: z.number().min(1, "Hours per week must be at least 1").max(60, "Hours per week cannot exceed 60"),
  salary: z.string().min(1, "Salary information is required"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  essentialRequirements: z.array(z.string()).min(1, "Please add at least one essential requirement"),
  desirableRequirements: z.array(z.string()),
  benefits: z.array(z.string()),
  startDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

const NHS_BANDS = [
  'Band 1', 'Band 2', 'Band 3', 'Band 4', 'Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b', 'Band 8c', 'Band 8d', 'Band 9'
];

const CONTRACT_TYPES = [
  'Permanent', 'Fixed Term', 'Locum', 'Bank', 'Secondment'
];

const CONTACT_ROLES = [
  'PCN Manager', 'Practice Manager', 'Clinical Director', 'Operations Manager', 'HR Manager'
];

const COMMON_BENEFITS = [
  'NHS Pension Scheme',
  'Annual Leave (27+ days)',
  'Professional Development',
  'Flexible Working',
  'Study Leave',
  'Car Parking',
  'Cycle to Work Scheme',
  'Employee Assistance Programme',
  'Childcare Vouchers',
  'Season Ticket Loans'
];

interface PrimaryCareRole {
  id: string;
  role_name: string;
  role_category: string;
  typical_nhs_bands: string[];
  description: string;
}

export default function PCNJobPostForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customRequirement, setCustomRequirement] = useState('');
  const [customDesirable, setCustomDesirable] = useState('');
  const [customBenefit, setCustomBenefit] = useState('');
  const [showCustomJobRole, setShowCustomJobRole] = useState(false);
  const { toast } = useToast();

  const form = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      pcnName: '',
      contactPersonName: '',
      contactPersonRole: '',
      email: '',
      phone: '',
      location: '',
      postcode: '',
      jobTitle: '',
      jobRole: '',
      customJobRole: '',
      nhsBand: '',
      contractType: '',
      hoursPerWeek: 37.5,
      salary: '',
      jobDescription: '',
      essentialRequirements: [],
      desirableRequirements: [],
      benefits: [],
      startDate: '',
      applicationDeadline: '',
      additionalInfo: '',
    }
  });

  // Fetch primary care roles
  const { data: primaryCareRoles = [] } = useQuery<PrimaryCareRole[]>({
    queryKey: ['/api/primary-care-roles'],
    queryFn: async () => {
      const response = await fetch('/api/primary-care-roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    }
  });

  const submitJobPost = useMutation({
    mutationFn: async (data: JobPostFormData) => {
      // Use custom job role if provided
      const finalJobRole = data.jobRole === 'custom' ? data.customJobRole : data.jobRole;
      const submitData = { ...data, jobRole: finalJobRole };
      
      const response = await apiRequest('/api/pcn/job-post', {
        method: 'POST',
        body: JSON.stringify(submitData),
      });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Job Post Created!",
        description: "Your PCN job posting has been successfully created and published.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Job Post Failed",
        description: error.message || "Failed to create job post. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: JobPostFormData) => {
    submitJobPost.mutate(data);
  };

  const addCustomRequirement = () => {
    if (customRequirement.trim()) {
      const current = form.getValues('essentialRequirements');
      form.setValue('essentialRequirements', [...current, customRequirement.trim()]);
      setCustomRequirement('');
    }
  };

  const addCustomDesirable = () => {
    if (customDesirable.trim()) {
      const current = form.getValues('desirableRequirements');
      form.setValue('desirableRequirements', [...current, customDesirable.trim()]);
      setCustomDesirable('');
    }
  };

  const addCustomBenefit = () => {
    if (customBenefit.trim()) {
      const current = form.getValues('benefits');
      form.setValue('benefits', [...current, customBenefit.trim()]);
      setCustomBenefit('');
    }
  };

  const removeRequirement = (index: number) => {
    const current = form.getValues('essentialRequirements');
    form.setValue('essentialRequirements', current.filter((_, i) => i !== index));
  };

  const removeDesirable = (index: number) => {
    const current = form.getValues('desirableRequirements');
    form.setValue('desirableRequirements', current.filter((_, i) => i !== index));
  };

  const removeBenefit = (index: number) => {
    const current = form.getValues('benefits');
    form.setValue('benefits', current.filter((_, i) => i !== index));
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Job Post Created Successfully!</CardTitle>
          <CardDescription className="text-lg">
            Your PCN job posting is now live and visible to qualified professionals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Your job posting is now visible to qualified professionals</li>
              <li>• Candidates will apply directly through the platform</li>
              <li>• You'll receive email notifications for new applications</li>
              <li>• Access your dashboard to manage applications and shortlist candidates</li>
            </ul>
          </div>
          <div className="text-center pt-4">
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Post a PCN Role</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Recruit qualified healthcare professionals for your Primary Care Network with NHS Band-appropriate salaries and comprehensive benefits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            PCN Job Posting Form
          </CardTitle>
          <CardDescription>
            Create a comprehensive job posting to attract the best healthcare professionals to your PCN
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* PCN Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">PCN Information</h3>
                <FormField
                  control={form.control}
                  name="pcnName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PCN Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., West London Primary Care Network" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPersonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPersonRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Role *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@pcn.nhs.uk" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="020 XXXX XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="London, Manchester, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postcode *</FormLabel>
                        <FormControl>
                          <Input placeholder="SW1A 1AA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Job Details</h3>
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Advanced Nurse Practitioner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomJobRole(value === 'custom');
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a primary care role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {primaryCareRoles.map((role) => (
                            <SelectItem key={role.id} value={role.role_name}>
                              <div className="flex flex-col">
                                <span>{role.role_name}</span>
                                <span className="text-xs text-gray-500">
                                  {role.typical_nhs_bands.join(', ')} • {role.role_category}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">
                            <span className="font-medium">+ Add Custom Role</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomJobRole && (
                  <FormField
                    control={form.control}
                    name="customJobRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Job Role *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter custom job role" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nhsBand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NHS Band *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select NHS Band" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NHS_BANDS.map((band) => (
                              <SelectItem key={band} value={band}>
                                {band}
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
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select contract type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTRACT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
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
                    name="hoursPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours per Week *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="60"
                            placeholder="37.5"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., £35,000 - £42,000 per annum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed description of the role, responsibilities, and working environment..."
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Requirements</h3>
                
                {/* Essential Requirements */}
                <FormField
                  control={form.control}
                  name="essentialRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Essential Requirements *</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add essential requirement"
                            value={customRequirement}
                            onChange={(e) => setCustomRequirement(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRequirement())}
                          />
                          <Button type="button" onClick={addCustomRequirement} variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((req, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {req}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => removeRequirement(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Desirable Requirements */}
                <FormField
                  control={form.control}
                  name="desirableRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desirable Requirements</FormLabel>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add desirable requirement"
                            value={customDesirable}
                            onChange={(e) => setCustomDesirable(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDesirable())}
                          />
                          <Button type="button" onClick={addCustomDesirable} variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((req, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {req}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => removeDesirable(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Benefits & Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Benefits & Additional Information</h3>
                
                {/* Benefits */}
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits Package</FormLabel>
                      <div className="space-y-3">
                        {/* Common Benefits Checkboxes */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3">
                          {COMMON_BENEFITS.map((benefit) => (
                            <div key={benefit} className="flex items-center space-x-2">
                              <Checkbox
                                id={benefit}
                                checked={field.value?.includes(benefit)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, benefit]);
                                  } else {
                                    field.onChange(field.value?.filter((b) => b !== benefit));
                                  }
                                }}
                              />
                              <Label htmlFor={benefit} className="text-sm">
                                {benefit}
                              </Label>
                            </div>
                          ))}
                        </div>
                        
                        {/* Custom Benefits */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add custom benefit"
                            value={customBenefit}
                            onChange={(e) => setCustomBenefit(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())}
                          />
                          <Button type="button" onClick={addCustomBenefit} variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Display Custom Benefits */}
                        {field.value.filter(b => !COMMON_BENEFITS.includes(b)).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.filter(b => !COMMON_BENEFITS.includes(b)).map((benefit, index) => (
                              <Badge key={benefit} variant="secondary" className="flex items-center gap-1">
                                {benefit}
                                <X 
                                  className="w-3 h-3 cursor-pointer" 
                                  onClick={() => removeBenefit(field.value.indexOf(benefit))}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="applicationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about the role, PCN, or application process..."
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={submitJobPost.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {submitJobPost.isPending ? "Creating..." : "Create Job Post"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}