import React, { useState } from 'react';
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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Brain, Users, Heart, Activity, Pill } from "lucide-react";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  profession: z.string().min(1, "Please select a profession"),
  professionalRegistrationNumber: z.string().optional(),
  professionalRegistrationBody: z.string().optional(),
  nhsBand: z.string().min(1, "Please select an NHS Band"),
  experience: z.string().min(1, "Please select experience level"),
  availableLocations: z.array(z.string()).min(1, "Please select at least one location"),
  specializations: z.array(z.string()),
  additionalSkills: z.string().optional(),
  previousNHSExperience: z.boolean(),
  consentDataProcessing: z.boolean().refine(val => val === true, "Consent for data processing is required"),
  consentReferenceChecks: z.boolean().refine(val => val === true, "Consent for reference checks is required"),
  consentTermsConditions: z.boolean().refine(val => val === true, "Acceptance of terms and conditions is required"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const PROFESSIONS = [
  'Physiotherapy',
  'Occupational Therapy', 
  'Speech & Language Therapy',
  'Clinical Psychology',
  'Counselling Psychology',
  'Dietetics',
  'Radiography',
  'Biomedical Science',
  'Clinical Engineering',
  'Audiology',
  'Orthoptics',
  'Podiatry',
  'Social Work'
];

const REGISTRATION_BODIES = [
  'HCPC (Health and Care Professions Council)',
  'RCCP (Royal College of Clinical Pharmacists)',
  'RCSLT (Royal College of Speech and Language Therapists)',
  'CSP (Chartered Society of Physiotherapy)',
  'RCOT (Royal College of Occupational Therapists)',
  'BPS (British Psychological Society)',
  'BDA (British Dietetic Association)',
  'SoR (Society of Radiographers)',
  'IBMS (Institute of Biomedical Science)',
  'BAA (British Academy of Audiology)',
  'BIOS (British and Irish Orthoptic Society)',
  'RCPOD (Royal College of Podiatry)',
  'BASW (British Association of Social Workers)'
];

const NHS_BANDS = [
  'Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b', 'Band 8c', 'Band 8d', 'Band 9'
];

const EXPERIENCE_LEVELS = [
  'Junior (0-2 years)',
  'Mid-level (3-5 years)', 
  'Senior (6+ years)',
  'Specialist (10+ years)'
];

const UK_LOCATIONS = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Sheffield', 'Newcastle',
  'Bristol', 'Brighton', 'Cambridge', 'Oxford', 'Cardiff', 'Edinburgh', 'Glasgow',
  'Belfast', 'Nottingham', 'Leicester', 'Coventry', 'Hull', 'Stoke-on-Trent'
];

const SPECIALIZATIONS = [
  'Acute Care', 'Mental Health', 'Paediatrics', 'Geriatrics', 'Neurology',
  'Musculoskeletal', 'Respiratory', 'Cardiology', 'Oncology', 'Rehabilitation'
];

export default function AlliedHealthcareRegistrationForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      profession: '',
      professionalRegistrationNumber: '',
      professionalRegistrationBody: '',
      nhsBand: '',
      experience: '',
      availableLocations: [],
      specializations: [],
      additionalSkills: '',
      previousNHSExperience: false,
      consentDataProcessing: false,
      consentReferenceChecks: false,
      consentTermsConditions: false,
    }
  });

  const submitRegistration = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest('/api/allied-healthcare/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Submitted!",
        description: "Your Allied Healthcare Professional registration has been successfully submitted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: RegistrationFormData) => {
    submitRegistration.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Registration Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for registering with JoyJoy Locums as an Allied Healthcare Professional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Our recruitment team will review your application within 2-3 business days</li>
              <li>• We'll contact you for an initial consultation call</li>
              <li>• Upon approval, you'll gain access to exclusive NHS opportunities</li>
              <li>• Start browsing and applying for roles across the UK</li>
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
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Allied Healthcare Professional Registration</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join JoyJoy Locums and access exclusive opportunities across NHS trusts and private healthcare providers throughout the UK.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Professional Registration Form
          </CardTitle>
          <CardDescription>
            Complete your professional profile to access NHS Band 5-9 opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="07XXX XXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your profession" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROFESSIONS.map((profession) => (
                              <SelectItem key={profession} value={profession}>
                                {profession}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="professionalRegistrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., HP123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="professionalRegistrationBody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Registration Body</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select registration body" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REGISTRATION_BODIES.map((body) => (
                              <SelectItem key={body} value={body}>
                                {body}
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
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPERIENCE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Location Preferences</h3>
                <FormField
                  control={form.control}
                  name="availableLocations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Locations *</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                        {UK_LOCATIONS.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={location}
                              checked={field.value?.includes(location)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, location]);
                                } else {
                                  field.onChange(field.value?.filter((l) => l !== location));
                                }
                              }}
                            />
                            <Label htmlFor={location} className="text-sm">
                              {location}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Specializations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Specializations & Skills</h3>
                <FormField
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinical Specializations</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3">
                        {SPECIALIZATIONS.map((spec) => (
                          <div key={spec} className="flex items-center space-x-2">
                            <Checkbox
                              id={spec}
                              checked={field.value?.includes(spec)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, spec]);
                                } else {
                                  field.onChange(field.value?.filter((s) => s !== spec));
                                }
                              }}
                            />
                            <Label htmlFor={spec} className="text-sm">
                              {spec}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Skills & Qualifications</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any additional skills, qualifications, or certifications..."
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="previousNHSExperience"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I have previous NHS experience
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Consent */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Consent & Agreement</h3>
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="consentDataProcessing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I consent to JoyJoy Locums processing my personal data for recruitment purposes *
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          <FormLabel>
                            I consent to reference checks and employment verification *
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consentTermsConditions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the Terms & Conditions and Privacy Policy *
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={submitRegistration.isPending}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  {submitRegistration.isPending ? "Submitting..." : "Submit Registration"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}