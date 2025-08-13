import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { User, Briefcase, Shield, FileText, CheckCircle, CalendarIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const registrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  })
    .refine((date) => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      const dayDiff = today.getDate() - date.getDate();
      const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
      return actualAge >= 18;
    }, "You must be at least 18 years old to register"),
  address: z.string().min(1, "Address is required"),
  postcode: z.string().min(1, "Postcode is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  nationalInsuranceNumber: z.string().optional(),

  // Professional Information
  role: z.string().min(1, "Role selection is required"),
  experience: z.number().min(0, "Experience must be 0 or greater"),
  hourlyRate: z.string().optional(),
  maxDistance: z.number().min(1, "Maximum travel distance is required"),
  
  // Certifications
  hasDbsCheck: z.boolean(),
  dbsExpiryDate: z.date().optional(),
  hasRightToWork: z.boolean(),
  isUkPassportHolder: z.boolean(),
  rightToWorkExpiryDate: z.date().optional(),
  hasMovingHandling: z.boolean(),
  movingHandlingExpiryDate: z.date().optional(),
  hasSafeguarding: z.boolean(),
  safeguardingExpiryDate: z.date().optional(),
  
  // Additional Information
  additionalSkills: z.string().optional(),
  previousExperience: z.string().optional(),
  references: z.string().optional(),
  
  // Consent & Agreement
  consentReferenceChecks: z.boolean().refine(val => val === true, {
    message: "You must consent to reference checks to proceed with your application"
  }),
  consentDbsChecks: z.boolean().refine(val => val === true, {
    message: "You must consent to DBS checks to proceed with your application"  
  }),
  agreeTermsConditions: z.boolean().refine(val => val === true, {
    message: "You must agree to our terms and conditions to proceed"
  })
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const STEPS = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Professional Details", icon: Briefcase },
  { id: 3, title: "Certifications", icon: Shield },
  { id: 4, title: "Additional Information", icon: FileText },
  { id: 5, title: "Review & Submit", icon: CheckCircle }
];

export default function StaffRegistrationFixed() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: undefined,
      address: "",
      postcode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      nationalInsuranceNumber: "",
      role: "",
      experience: 0,
      hourlyRate: "",
      maxDistance: 10,
      hasDbsCheck: false,
      dbsExpiryDate: undefined,
      hasRightToWork: false,
      isUkPassportHolder: false,
      rightToWorkExpiryDate: undefined,
      hasMovingHandling: false,
      movingHandlingExpiryDate: undefined,
      hasSafeguarding: false,
      safeguardingExpiryDate: undefined,
      additionalSkills: "",
      previousExperience: "",
      references: "",
      consentReferenceChecks: false,
      consentDbsChecks: false,
      agreeTermsConditions: false
    }
  });

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  const parseInputDate = (dateString: string) => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  const nextStep = async () => {
    // Validate current step before proceeding
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'address', 'postcode', 'emergencyContactName', 'emergencyContactPhone'];
        break;
      case 2:
        fieldsToValidate = ['role', 'experience', 'maxDistance'];
        break;
      case 3:
        // Check certification requirements
        if (form.watch("hasDbsCheck") && !form.watch("dbsExpiryDate")) {
          toast({
            title: "Validation Error",
            description: "DBS expiry date is required when you have a DBS check",
            variant: "destructive",
          });
          return;
        }
        if (form.watch("hasRightToWork") && !form.watch("isUkPassportHolder") && !form.watch("rightToWorkExpiryDate")) {
          toast({
            title: "Validation Error", 
            description: "Right to work expiry date is required",
            variant: "destructive",
          });
          return;
        }
        break;
      case 4:
        fieldsToValidate = ['consentReferenceChecks', 'consentDbsChecks', 'agreeTermsConditions'];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors above before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    // Special validation for date of birth
    const dateOfBirth = form.watch("dateOfBirth");
    if (currentStep === 1 && dateOfBirth) {
      const age = calculateAge(dateOfBirth);
      if (age < 18) {
        toast({
          title: "Age Requirement",
          description: "You must be at least 18 years old to register",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    // Final age validation before submission
    if (data.dateOfBirth) {
      const age = calculateAge(data.dateOfBirth);
      if (age < 18) {
        toast({
          title: "Registration Blocked",
          description: "You must be at least 18 years old to register. Current age: " + age,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate all required consents
    if (!data.consentReferenceChecks || !data.consentDbsChecks || !data.agreeTermsConditions) {
      toast({
        title: "Consent Required",
        description: "All consent checkboxes must be checked to complete registration",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          consent_timestamp: new Date().toISOString(),
          registration_source: 'website',
          registration_complete: true
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome to JoyJoy Care! Check your email for next steps.",
      });

      setLocation('/registration-success');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join JoyJoy Care</h1>
          <p className="text-gray-600">Start your care staffing journey with us</p>
          <div className="mt-4">
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Step {currentStep} of {STEPS.length}</p>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 overflow-x-auto">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center space-x-2 min-w-max">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
                  <span>{STEPS[currentStep - 1].title}</span>
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Tell us about yourself"}
                  {currentStep === 2 && "Your professional background"}
                  {currentStep === 3 && "Certifications and qualifications"}
                  {currentStep === 4 && "Additional information"}
                  {currentStep === 5 && "Review and submit your application"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+44 7XXX XXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth * (Must be 18 or older)</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="date"
                                  max={formatDateForInput(maxDate)}
                                  min="1940-01-01"
                                  value={formatDateForInput(field.value)}
                                  onChange={(e) => {
                                    const date = parseInputDate(e.target.value);
                                    if (date) {
                                      const age = calculateAge(date);
                                      if (age < 18) {
                                        toast({
                                          title: "Age Requirement",
                                          description: "You must be at least 18 years old to register",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                    }
                                    field.onChange(date);
                                  }}
                                  className="w-full"
                                />
                                {field.value && (
                                  <p className={`text-sm ${
                                    calculateAge(field.value) >= 18 
                                      ? 'text-green-600' 
                                      : 'text-red-600 font-medium'
                                  }`}>
                                    Age: {calculateAge(field.value)} years old
                                    {calculateAge(field.value) < 18 && ' - Must be 18 or older'}
                                  </p>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Textarea placeholder="123 Main Street, City" {...field} />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+44 7XXX XXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="nationalInsuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National Insurance Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="QQ 12 34 56 C" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Professional Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Care Role *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your care role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
                              <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
                              <SelectItem value="support_worker">Support Worker</SelectItem>
                              <SelectItem value="care_assistant">Care Assistant</SelectItem>
                              <SelectItem value="senior_carer">Senior Carer</SelectItem>
                              <SelectItem value="activities_coordinator">Activities Coordinator</SelectItem>
                              <SelectItem value="nurse">Nurse</SelectItem>
                              <SelectItem value="team_leader">Team Leader</SelectItem>
                              <SelectItem value="deputy_manager">Deputy Manager</SelectItem>
                              <SelectItem value="care_manager">Care Manager</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                max="50"
                                value={field.value}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired Hourly Rate (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="£15.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="maxDistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Travel Distance (miles) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="100"
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 3: Certifications */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Please indicate which certifications you currently have. You'll be able to upload documents later.
                    </p>

                    {/* DBS Check */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">DBS Check</h4>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="hasDbsCheck"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>I have a valid DBS check</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch("hasDbsCheck") && (
                          <div className="mt-3">
                            <FormField
                              control={form.control}
                              name="dbsExpiryDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={formatDateForInput(field.value)}
                                      onChange={(e) => {
                                        const date = parseInputDate(e.target.value);
                                        field.onChange(date);
                                      }}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-[240px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right to Work */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">Right to Work</h4>
                          <Badge variant="destructive">Required</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="isUkPassportHolder"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                      form.setValue("hasRightToWork", true);
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium text-blue-600">I am a UK passport holder</FormLabel>
                                <p className="text-xs text-muted-foreground">UK passport holders have automatic right to work</p>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        {!form.watch("isUkPassportHolder") && (
                          <>
                            <FormField
                              control={form.control}
                              name="hasRightToWork"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>I have a valid right to work</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />

                            {form.watch("hasRightToWork") && (
                              <div className="mt-3">
                                <FormField
                                  control={form.control}
                                  name="rightToWorkExpiryDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="date"
                                          value={formatDateForInput(field.value)}
                                          onChange={(e) => {
                                            const date = parseInputDate(e.target.value);
                                            field.onChange(date);
                                          }}
                                          min={new Date().toISOString().split('T')[0]}
                                          className="w-[240px]"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Additional Certifications */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Additional Certifications</h4>
                        <Badge variant="secondary">Optional</Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="hasMovingHandling"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>I have a valid moving & handling certification</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch("hasMovingHandling") && (
                          <div className="ml-6">
                            <FormField
                              control={form.control}
                              name="movingHandlingExpiryDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={formatDateForInput(field.value)}
                                      onChange={(e) => {
                                        const date = parseInputDate(e.target.value);
                                        field.onChange(date);
                                      }}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-[240px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="hasSafeguarding"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>I have a valid safeguarding adults certification</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch("hasSafeguarding") && (
                          <div className="ml-6">
                            <FormField
                              control={form.control}
                              name="safeguardingExpiryDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      value={formatDateForInput(field.value)}
                                      onChange={(e) => {
                                        const date = parseInputDate(e.target.value);
                                        field.onChange(date);
                                      }}
                                      min={new Date().toISOString().split('T')[0]}
                                      className="w-[240px]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Additional Information */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="additionalSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Skills (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Please describe any additional skills or specializations..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previousExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Experience (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us about your previous care experience..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="references"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>References (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Please provide reference details if available..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Consent Section */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium mb-3">Consent & Agreement</h4>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="consentReferenceChecks"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-red-600">I consent to reference checks *</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  We may contact your previous employers to verify your employment history
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="consentDbsChecks"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-red-600">I consent to DBS checks *</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  Required for working in care homes and with vulnerable adults
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="agreeTermsConditions"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-red-600">I agree to the terms and conditions *</FormLabel>
                                <p className="text-xs text-muted-foreground">
                                  By checking this box, you agree to our{' '}
                                  <a href="/terms-of-service" className="text-blue-600 hover:underline">
                                    Terms of Service
                                  </a>{' '}
                                  and{' '}
                                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                                    Privacy Policy
                                  </a>
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Review Your Application</h3>
                      <p className="text-sm text-muted-foreground">
                        Please review your information before submitting
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-600">Personal Information</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Name:</strong> {form.watch("firstName")} {form.watch("lastName")}</p>
                          <p><strong>Email:</strong> {form.watch("email")}</p>
                          <p><strong>Phone:</strong> {form.watch("phone")}</p>
                          {form.watch("dateOfBirth") && (
                            <p><strong>Age:</strong> {calculateAge(form.watch("dateOfBirth"))} years old</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-600">Professional Details</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Role:</strong> {form.watch("role")}</p>
                          <p><strong>Experience:</strong> {form.watch("experience")} years</p>
                          <p><strong>Max Distance:</strong> {form.watch("maxDistance")} miles</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-600">Certifications</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>DBS Check:</strong> {form.watch("hasDbsCheck") ? "Yes" : "No"}</p>
                          <p><strong>Right to Work:</strong> {form.watch("hasRightToWork") || form.watch("isUkPassportHolder") ? "Yes" : "No"}</p>
                          <p><strong>Moving & Handling:</strong> {form.watch("hasMovingHandling") ? "Yes" : "No"}</p>
                          <p><strong>Safeguarding:</strong> {form.watch("hasSafeguarding") ? "Yes" : "No"}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-blue-600">Consent Status</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Reference Checks:</strong> {form.watch("consentReferenceChecks") ? "✓ Consented" : "✗ Not consented"}</p>
                          <p><strong>DBS Checks:</strong> {form.watch("consentDbsChecks") ? "✓ Consented" : "✗ Not consented"}</p>
                          <p><strong>Terms & Conditions:</strong> {form.watch("agreeTermsConditions") ? "✓ Agreed" : "✗ Not agreed"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-800">
                          <strong>Next Steps:</strong> After submission, you'll receive a welcome email with portal access details and document upload instructions.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit">
                    Submit Application
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}