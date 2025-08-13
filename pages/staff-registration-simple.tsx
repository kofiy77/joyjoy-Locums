import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle, User, Briefcase, Shield, MapPin, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const healthcareRoles = [
  "Healthcare Assistant",
  "Senior Healthcare Assistant", 
  "Registered Nurse",
  "Senior Registered Nurse",
  "Support Worker",
  "Senior Support Worker",
  "Activities Coordinator"
];

const registrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  dateOfBirth: z.date({ required_error: "Date of birth is required" })
    .refine((date) => {
      const today = new Date();
      const birthDate = new Date(date);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      
      const exactAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
      return exactAge >= 18;
    }, {
      message: "You must be at least 18 years old to register"
    }),
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

export default function StaffRegistrationSimple() {
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

  const submitRegistration = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await fetch("/api/staff/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted",
        description: "Redirecting to confirmation page...",
        variant: "default"
      });
      setLocation("/registration-success");
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive"
      });
    }
  });

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "firstName", "lastName", "email", "phone", "dateOfBirth", 
          "address", "postcode", "emergencyContactName", "emergencyContactPhone"
        ];
        
        // Special age validation for step 1
        const dateOfBirth = form.getValues("dateOfBirth");
        if (dateOfBirth) {
          const calculateAge = (birthDate: Date) => {
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
          };
          
          const age = calculateAge(dateOfBirth);
          if (age < 18) {
            toast({
              title: "Age Requirement Not Met",
              description: `You must be at least 18 years old to register. Current age: ${age} years`,
              variant: "destructive",
            });
            return false;
          }
        }
        break;
      case 2:
        fieldsToValidate = ["role", "experience", "maxDistance"];
        break;
      case 3:
        // No specific validation for certifications step
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    console.log("Validation result:", result);
    console.log("Form errors:", form.formState.errors);
    console.log("Current form values:", form.getValues());
    return result;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    console.log("📤 Final step - submitting registration...");
    submitRegistration.mutate(data);
  };

  const renderPersonalInformation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your first name" {...field} />
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
                <Input placeholder="Enter your last name" {...field} />
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
          render={({ field }) => {
            const calculateAge = (birthDate: Date) => {
              const today = new Date();
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              const dayDiff = today.getDate() - birthDate.getDate();
              return age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
            };

            const currentYear = new Date().getFullYear();
            const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
            const months = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const days = Array.from({ length: 31 }, (_, i) => i + 1);

            const selectedDate = field.value ? new Date(field.value) : null;
            const selectedYear = selectedDate ? selectedDate.getFullYear() : undefined;
            const selectedMonth = selectedDate ? selectedDate.getMonth() : undefined;
            const selectedDay = selectedDate ? selectedDate.getDate() : undefined;

            const updateDate = (year?: number, month?: number, day?: number) => {
              if (year !== undefined && month !== undefined && day !== undefined) {
                const newDate = new Date(year, month, day);
                if (!isNaN(newDate.getTime())) {
                  field.onChange(newDate);
                }
              }
            };

            return (
              <FormItem>
                <FormLabel>Date of Birth * (Must be 18 or older)</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    {/* Dropdown Selection */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm font-medium">Day</Label>
                        <Select
                          value={selectedDay?.toString() || ""}
                          onValueChange={(day) => {
                            const newDay = parseInt(day);
                            updateDate(selectedYear || currentYear - 25, selectedMonth || 0, newDay);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Month</Label>
                        <Select
                          value={selectedMonth?.toString() || ""}
                          onValueChange={(month) => {
                            const newMonth = parseInt(month);
                            updateDate(selectedYear || currentYear - 25, newMonth, selectedDay || 1);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Year</Label>
                        <Select
                          value={selectedYear?.toString() || ""}
                          onValueChange={(year) => {
                            const newYear = parseInt(year);
                            updateDate(newYear, selectedMonth || 0, selectedDay || 1);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Alternative: HTML Date Input */}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Or use date picker:</Label>
                      <Input
                        type="date"
                        value={field.value ? (new Date(field.value).toISOString().split('T')[0]) : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value);
                            if (!isNaN(date.getTime())) {
                              field.onChange(date);
                            }
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                        max={new Date(currentYear - 18, 11, 31).toISOString().split('T')[0]}
                        min="1940-01-01"
                        className="w-full"
                      />
                    </div>

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
            );
          }}
        />
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address *</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter your full address"
                className="resize-none"
                {...field}
              />
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
                <Input placeholder="Emergency contact full name" {...field} />
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
              <Input placeholder="AB 12 34 56 C" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderProfessionalDetails = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary Role *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {healthcareRoles.map((role) => (
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
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
              <FormLabel>Preferred Hourly Rate (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="£16.50" {...field} />
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
                placeholder="10"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Required Certifications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please indicate which certifications you currently have. You'll be able to upload documents later.
        </p>
      </div>

      {/* DBS Check */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">DBS Check</h4>
            <Badge variant="destructive">Required</Badge>
          </div>
        </div>
        
        <div className="flex flex-row items-start space-x-3 space-y-0">
          <Checkbox
            checked={form.watch("hasDbsCheck") || false}
            onCheckedChange={(checked) => {
              console.log("DBS checkbox clicked:", checked);
              form.setValue("hasDbsCheck", !!checked);
            }}
          />
          <div className="space-y-1 leading-none">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I have a valid DBS check
            </label>
          </div>
        </div>

        {form.watch("hasDbsCheck") && (
          <div className="mt-3">
            <FormField
              control={form.control}
              name="dbsExpiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Select expiry date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
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
                    checked={field.value || false}
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
                        checked={field.value || false}
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : "Select expiry date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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

      {/* Moving & Handling */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">Moving & Handling</h4>
            <Badge variant="destructive">Required</Badge>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="hasMovingHandling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
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
          <div className="mt-3">
            <FormField
              control={form.control}
              name="movingHandlingExpiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Select expiry date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* Safeguarding Adults */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">Safeguarding Adults</h4>
            <Badge variant="destructive">Required</Badge>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="hasSafeguarding"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
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
          <div className="mt-3">
            <FormField
              control={form.control}
              name="safeguardingExpiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-red-600">Expiry Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : "Select expiry date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderAdditionalInformation = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="additionalSkills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Skills (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="List any additional skills, qualifications, or specializations..."
                className="resize-none"
                rows={3}
                {...field}
              />
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
              <Textarea 
                placeholder="Describe your previous care experience..."
                className="resize-none"
                rows={3}
                {...field}
              />
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
              <Textarea 
                placeholder="Provide reference contact details if available..."
                className="resize-none"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Consent Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Consent & Agreement</h3>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="consentReferenceChecks"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    I consent to reference checks being conducted *
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    We may contact previous employers or referees to verify your experience and suitability
                  </p>
                </div>
                <FormMessage />
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
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    I consent to DBS checks being conducted *
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    DBS checks are mandatory for all care workers to ensure safeguarding compliance
                  </p>
                </div>
                <FormMessage />
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
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium">
                    I agree to the terms and conditions *
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    By checking this box, you agree to our terms of service and privacy policy
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const renderReviewSubmit = () => {
    const formData = form.getValues();
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">Review Your Application</h3>
          <p className="text-sm text-muted-foreground">
            Please review your information before submitting your application.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
              <p><strong>Date of Birth:</strong> {formData.dateOfBirth ? format(formData.dateOfBirth, "dd/MM/yyyy") : "Not provided"}</p>
              <p><strong>Address:</strong> {formData.address}</p>
              <p><strong>Postcode:</strong> {formData.postcode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Role:</strong> {formData.role}</p>
              <p><strong>Experience:</strong> {formData.experience} years</p>
              <p><strong>Max Travel Distance:</strong> {formData.maxDistance} miles</p>
              {formData.hourlyRate && <p><strong>Preferred Rate:</strong> {formData.hourlyRate}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>DBS Check:</strong> {formData.hasDbsCheck ? "✅ Valid" : "❌ Not provided"}</p>
              <p><strong>Right to Work:</strong> {formData.hasRightToWork || formData.isUkPassportHolder ? "✅ Valid" : "❌ Not provided"}</p>
              <p><strong>Moving & Handling:</strong> {formData.hasMovingHandling ? "✅ Valid" : "❌ Not provided"}</p>
              <p><strong>Safeguarding:</strong> {formData.hasSafeguarding ? "✅ Valid" : "❌ Not provided"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Reference Checks:</strong> {formData.consentReferenceChecks ? "✅ Agreed" : "❌ Not agreed"}</p>
              <p><strong>DBS Checks:</strong> {formData.consentDbsChecks ? "✅ Agreed" : "❌ Not agreed"}</p>
              <p><strong>Terms & Conditions:</strong> {formData.agreeTermsConditions ? "✅ Agreed" : "❌ Not agreed"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Next Steps</h4>
          <ul className="text-sm space-y-1">
            <li>• Your application will be reviewed by our team</li>
            <li>• You'll receive email confirmation of submission</li>
            <li>• We'll contact you within 2-3 business days</li>
            <li>• Document uploads will be requested if your application progresses</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInformation();
      case 2: return renderProfessionalDetails();
      case 3: return renderCertifications();
      case 4: return renderAdditionalInformation();
      case 5: return renderReviewSubmit();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">
              Care Professional Registration
            </CardTitle>
            <CardDescription>
              Start your care staffing journey with us
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        isActive ? "bg-blue-600 text-white" : 
                        isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                      )}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-center">
                        <div className={cn(
                          "font-medium",
                          isActive ? "text-blue-600" : 
                          isCompleted ? "text-green-600" : "text-gray-600"
                        )}>
                          {step.title}
                        </div>
                        <div className="text-gray-500">
                          Step {step.id} of {STEPS.length}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Form Content */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  {currentStep === STEPS.length ? (
                    <Button
                      type="submit"
                      disabled={submitRegistration.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitRegistration.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}