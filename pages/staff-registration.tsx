import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const certificationTypes = [
  { value: "dbs_check", label: "DBS Check", required: true },
  { value: "right_to_work", label: "Right to Work", required: true },
  { value: "moving_handling", label: "Moving & Handling", required: true },
  { value: "safeguarding", label: "Safeguarding Adults", required: true },
  { value: "first_aid", label: "First Aid", required: false },
  { value: "medication_administration", label: "Medication Administration", required: false },
  { value: "dementia_care", label: "Dementia Care", required: false },
  { value: "infection_control", label: "Infection Control", required: false },
  { value: "food_hygiene", label: "Food Hygiene", required: false },
  { value: "manual_handling", label: "Manual Handling", required: false }
];

const availabilitySchema = z.object({
  monday: z.boolean(),
  tuesday: z.boolean(),
  wednesday: z.boolean(),
  thursday: z.boolean(),
  friday: z.boolean(),
  saturday: z.boolean(),
  sunday: z.boolean()
});

const certificationSchema = z.object({
  type: z.string(),
  hasValid: z.boolean(),
  expiryDate: z.date().optional(),
  needsUpdate: z.boolean().default(false),
  isUkPassportHolder: z.boolean().optional()
});

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
      
      // Calculate exact age
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
  
  // Availability
  availability: availabilitySchema,
  preferredLocations: z.array(z.string()).optional(),

  // Certifications & Compliance
  certifications: z.array(certificationSchema),
  
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
  { id: 4, title: "Availability", icon: Clock },
  { id: 5, title: "Additional Information", icon: FileText },
  { id: 6, title: "Review & Submit", icon: CheckCircle }
];

export default function StaffRegistration() {
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
      address: "",
      postcode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      role: "",
      experience: 0,
      hourlyRate: "",
      maxDistance: 10,
      availability: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      certifications: certificationTypes.map(cert => ({
        type: cert.value,
        hasValid: false,
        needsUpdate: false,
        isUkPassportHolder: cert.value === 'right_to_work' ? false : undefined
      })),
      preferredLocations: [],
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
      // Redirect to success page
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
        break;
      case 2:
        fieldsToValidate = ["role", "experience", "maxDistance"];
        break;
      case 3:
        fieldsToValidate = ["certifications"];
        // Additional validation for certifications with expiry dates
        const currentCertifications = form.getValues("certifications");
        const invalidCerts = currentCertifications.filter(cert => {
          // Skip expiry date requirement for UK passport holders with Right to Work
          if (cert.type === 'right_to_work' && cert.isUkPassportHolder) {
            return false;
          }
          return cert.hasValid && !cert.expiryDate;
        });
        if (invalidCerts.length > 0) {
          toast({
            title: "Missing Expiry Dates",
            description: "Please provide expiry dates for all valid certifications.",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 4:
        fieldsToValidate = ["availability"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    console.log('Form submitted, current step:', currentStep, 'total steps:', STEPS.length);
    
    if (currentStep === STEPS.length) {
      // Final validation for certifications
      const invalidCertifications = data.certifications.filter(cert => {
        // Skip expiry date requirement for UK passport holders with Right to Work
        if (cert.type === 'right_to_work' && cert.isUkPassportHolder) {
          return false;
        }
        return cert.hasValid && !cert.expiryDate;
      });
      if (invalidCertifications.length > 0) {
        toast({
          title: "Missing Expiry Dates",
          description: "Please provide expiry dates for all valid certifications before submitting.",
          variant: "destructive"
        });
        setCurrentStep(3); // Go back to certification step
        return;
      }
      
      console.log('Submitting registration data:', data);
      submitRegistration.mutate(data);
    } else {
      console.log('Not on final step, moving to next step');
      await nextStep();
    }
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

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth * (Must be 18 or older)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <span className="flex justify-between w-full">
                            <span>{format(field.value, "dd/MM/yyyy")}</span>
                            <span className="text-sm text-muted-foreground">
                              Age: {calculateAge(field.value)}
                            </span>
                          </span>
                        ) : (
                          "Select your date of birth"
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 space-y-3">
                      <div className="flex gap-2">
                        <Select
                          value={field.value ? field.value.getFullYear().toString() : ""}
                          onValueChange={(year) => {
                            const currentDate = field.value || new Date();
                            const newDate = new Date(currentDate);
                            newDate.setFullYear(parseInt(year));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: new Date().getFullYear() - 18 - 1940 + 1 }, (_, i) => {
                              const year = new Date().getFullYear() - 18 - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={field.value ? (field.value.getMonth() + 1).toString() : ""}
                          onValueChange={(month) => {
                            const currentDate = field.value || new Date();
                            const newDate = new Date(currentDate);
                            newDate.setMonth(parseInt(month) - 1);
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = i + 1;
                              const monthName = new Date(2000, i, 1).toLocaleDateString('en-GB', { month: 'short' });
                              return (
                                <SelectItem key={month} value={month.toString()}>
                                  {monthName}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>

                        <Select
                          value={field.value ? field.value.getDate().toString() : ""}
                          onValueChange={(day) => {
                            const currentDate = field.value || new Date();
                            const newDate = new Date(currentDate);
                            newDate.setDate(parseInt(day));
                            field.onChange(newDate);
                          }}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => {
                              const day = i + 1;
                              return (
                                <SelectItem key={day} value={day.toString()}>
                                  {day}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date();
                          const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                          return date > today || date < new Date("1900-01-01") || date > eighteenYearsAgo;
                        }}
                        initialFocus
                        className="rounded-md border-0"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {field.value && (
                  <p className="text-sm text-muted-foreground">
                    Age: {calculateAge(field.value)} years old
                  </p>
                )}
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
              <Textarea placeholder="Enter your full address" {...field} />
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
                <Input placeholder="Full name" {...field} />
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
            <FormLabel>Role *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
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
                  value={field.value === undefined ? "" : field.value.toString()}
                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
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
              <FormLabel>Expected Hourly Rate (£) (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="18.00" 
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
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
                value={field.value === undefined ? "" : field.value.toString()}
                onChange={(e) => field.onChange(e.target.value === "" ? 10 : parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Required Certifications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please indicate which certifications you currently have. You'll be able to upload documents later.
        </p>
      </div>

      <div className="space-y-4">
        {certificationTypes.map((cert, index) => (
          <div key={cert.value} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{cert.label}</h4>
                {cert.required && <Badge variant="destructive">Required</Badge>}
              </div>
            </div>

            {cert.value === 'right_to_work' ? (
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name={`certifications.${index}.isUkPassportHolder` as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            // If UK passport holder is checked, automatically set hasValid to true
                            if (checked) {
                              form.setValue(`certifications.${index}.hasValid` as any, true);
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
                
                {!form.watch(`certifications.${index}.isUkPassportHolder` as any) && (
                  <FormField
                    control={form.control}
                    name={`certifications.${index}.hasValid` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>I have a valid {cert.label.toLowerCase()}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            ) : (
              <FormField
                control={form.control}
                name={`certifications.${index}.hasValid` as any}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I have a valid {cert.label.toLowerCase()}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {form.watch(`certifications.${index}.hasValid` as any) && 
             !(cert.value === 'right_to_work' && form.watch(`certifications.${index}.isUkPassportHolder` as any)) && (
              <div className="mt-3">
                <FormField
                  control={form.control}
                  name={`certifications.${index}.expiryDate` as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-red-600">Expiry Date * (Required for valid certificates)</FormLabel>
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
        ))}
      </div>
    </div>
  );

  const renderAvailability = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Weekly Availability</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select the days you're available to work. You can update this later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
          <FormField
            key={day}
            control={form.control}
            name={`availability.${day}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="capitalize">{day}</FormLabel>
                </div>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );

  const renderAdditionalInformation = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="additionalSkills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Skills & Qualifications</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="List any additional skills, qualifications, or specializations..."
                className="min-h-[100px]"
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
            <FormLabel>Previous Healthcare Experience</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your previous healthcare experience, including types of care settings..."
                className="min-h-[100px]"
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
            <FormLabel>References</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Provide contact details for 2-3 professional references..."
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderReviewAndSubmit = () => {
    const formData = form.getValues();
    const validCertifications = formData.certifications.filter(cert => cert.hasValid);
    const availableDays = Object.entries(formData.availability)
      .filter(([_, available]) => available)
      .map(([day, _]) => day);

    return (
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-medium mb-3">Review Your Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Role:</strong> {formData.role}</p>
              <p><strong>Experience:</strong> {formData.experience} years</p>
              <p><strong>Phone:</strong> {formData.phone}</p>
            </div>
            <div>
              <p><strong>Postcode:</strong> {formData.postcode}</p>
              <p><strong>Max Distance:</strong> {formData.maxDistance} miles</p>
              <p><strong>Available Days:</strong> {availableDays.length}</p>
              <p><strong>Valid Certifications:</strong> {validCertifications.length}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-4">Consent & Agreement Required</h4>
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
                    <FormLabel className="text-sm font-normal">
                      I consent to JoyJoy Care carrying out reference checks with my previous employers and professional contacts as part of the application process.
                    </FormLabel>
                    <FormMessage />
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
                    <FormLabel className="text-sm font-normal">
                      I consent to JoyJoy Care initiating and processing DBS (Disclosure and Barring Service) checks as required for healthcare positions.
                    </FormLabel>
                    <FormMessage />
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
                    <FormLabel className="text-sm font-normal">
                      I agree to JoyJoy Care's{" "}
                      <a href="/terms-of-service" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="/privacy-policy" target="_blank" className="text-blue-600 underline hover:text-blue-800">
                        Privacy Policy
                      </a>.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• We'll review your application within 24 hours</li>
            <li>• You'll receive an email with document upload instructions</li>
            <li>• Our team will contact you to schedule a brief interview</li>
            <li>• Once approved, you'll be added to our staffing pool</li>
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
      case 4: return renderAvailability();
      case 5: return renderAdditionalInformation();
      case 6: return renderReviewAndSubmit();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join JoyJoy Care
          </h1>
          <p className="text-lg text-gray-600">
            Start your care staffing journey with us
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2",
                  currentStep >= step.id 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "bg-white border-gray-300 text-gray-500"
                )}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div key={step.id} className="text-xs text-center max-w-[100px]">
                {step.title}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                {renderStepContent()}

                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitRegistration.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitRegistration.isPending ? "Submitting..." : "Submit Registration"}
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