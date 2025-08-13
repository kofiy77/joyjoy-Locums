import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Building2, Mail, Phone, MapPin, Bed, Shield, Heart, Users, Clock, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Dynamic form schema based on care setting type
const enquirySchema = z.object({
  managerName: z.string().min(1, "Manager name is required"),
  email: z.string().email("Valid email address is required"),
  careHomeName: z.string().min(1, "Care home name is required"),
  location: z.string().min(1, "Location is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  careSettingType: z.enum(["residential", "nursing", "domiciliary"]),
  facilityCapacity: z.number().min(1, "Capacity must be at least 1"),
  specializations: z.array(z.string()).optional(),
  servicesOffered: z.array(z.string()).optional(),
  cqcRegistrationNumber: z.string().optional(),
  serviceAreas: z.array(z.string()).optional(),
  clientAgeGroups: z.array(z.string()).optional(),
  medicalConditionsSupported: z.array(z.string()).optional(),
  equipmentAvailable: z.array(z.string()).optional(),
  operationalHours: z.string().optional(),
  mealServices: z.boolean().optional(),
  transportProvided: z.boolean().optional(),
  emergencyResponse: z.boolean().optional(),
  nursingStaffRequired: z.boolean().optional(),
  localAuthorityContracts: z.boolean().optional(),
  privatePayClients: z.boolean().optional(),
  urgentStaffingNeeds: z.string().optional(),
  currentStaffingChallenges: z.string().optional(),
  additionalInfo: z.string().optional(),
  promotionSource: z.string().optional(),
});

type EnquiryData = z.infer<typeof enquirySchema>;

// Care type configurations
const careTypeConfig = {
  residential: {
    title: "Residential Care Home Enquiry",
    subtitle: "Join our network of residential care providers",
    icon: Building2,
    description: "Connect with qualified care staff for your residential care home",
    capacityLabel: "Number of Beds"
  },
  nursing: {
    title: "Nursing Home Enquiry", 
    subtitle: "Professional nursing care staffing solutions",
    icon: Shield,
    description: "Access registered nurses and healthcare assistants for your nursing home",
    capacityLabel: "Number of Beds"
  },
  domiciliary: {
    title: "Domiciliary Care Enquiry",
    subtitle: "Home care staffing made simple", 
    icon: Heart,
    description: "Find qualified care workers for your domiciliary care services",
    capacityLabel: "Client Capacity"
  }
};

// Field options for dynamic dropdowns
const fieldOptions = {
  specializations: [
    "Dementia Care", "Learning Disabilities", "Mental Health", "Physical Disabilities",
    "Palliative Care", "Respite Care", "Young Adults", "Elderly Care"
  ],
  careLevels: [
    "Personal Care", "Nursing Care", "Residential Care", "Supported Living", "Independent Living"
  ],
  medicalConditions: [
    "Alzheimer's Disease", "Parkinson's Disease", "Diabetes", "Stroke Recovery",
    "Heart Conditions", "Respiratory Conditions", "Mobility Issues", "Complex Medical Needs"
  ],
  equipment: [
    "Hoists", "Hospital Beds", "Wheelchairs", "Walking Aids", "Oxygen Equipment",
    "Monitoring Equipment", "Physiotherapy Equipment", "Sensory Equipment"
  ],
  servicesOffered: [
    "Personal Care", "Medication Management", "Meal Preparation", "Companionship",
    "Domestic Tasks", "Shopping", "Appointments", "Night Care", "Live-in Care"
  ],
  clientAgeGroups: ["18-25 years", "26-40 years", "41-65 years", "66-80 years", "81+ years"],
  serviceAreas: [
    "City Centre", "North London", "South London", "East London", "West London",
    "Greater London", "Home Counties", "Within 10 miles", "Within 20 miles", "Within 30 miles"
  ]
};

export default function CareHomeEnquiry() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [careSettingType, setCareSettingType] = useState<"residential" | "nursing" | "domiciliary">("residential");
  const { toast } = useToast();

  // Get care type from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') as "residential" | "nursing" | "domiciliary";
    if (type && ['residential', 'nursing', 'domiciliary'].includes(type)) {
      setCareSettingType(type);
    }
  }, []);

  const form = useForm<EnquiryData>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      managerName: "",
      email: "",
      careHomeName: "",
      location: "",
      contactPhone: "",
      careSettingType: careSettingType,
      facilityCapacity: 1,
      specializations: [],
      servicesOffered: [],
      serviceAreas: [],
      clientAgeGroups: [],
      medicalConditionsSupported: [],
      equipmentAvailable: [],
      cqcRegistrationNumber: "",
      operationalHours: "",
      mealServices: false,
      transportProvided: false,
      emergencyResponse: false,
      nursingStaffRequired: false,
      localAuthorityContracts: false,
      privatePayClients: false,
      urgentStaffingNeeds: "",
      currentStaffingChallenges: "",
      additionalInfo: "",
      promotionSource: "",
    },
  });

  // Update form when care setting type changes
  useEffect(() => {
    form.setValue('careSettingType', careSettingType);
  }, [careSettingType, form]);

  const onSubmit = async (data: EnquiryData) => {
    setIsLoading(true);
    try {
      await apiRequest("/api/care-home-enquiry", "POST", data);
      
      setIsSubmitted(true);
      toast({
        title: "Enquiry Submitted",
        description: "We'll be in touch within 24 hours to discuss your requirements.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit enquiry",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your interest! Our team will review your enquiry and contact you within 24 hours to discuss how JoyJoy Care can support your staffing needs.
                </p>
                <div className="space-y-3">
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link href="/promotions">
                    <Button className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Learn About Free First Shift
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const config = careTypeConfig[careSettingType];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex justify-center mb-4">
            <IconComponent className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{config.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{config.subtitle}</p>
          <p className="text-gray-500">{config.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Care Setting Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Care Setting Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <h3 className="col-span-full text-lg font-semibold mb-4">Select Your Care Setting Type</h3>
                {Object.entries(careTypeConfig).map(([type, config]) => (
                  <div
                    key={type}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      careSettingType === type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCareSettingType(type as "residential" | "nursing" | "domiciliary")}
                  >
                    <div className="text-center">
                      <config.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-medium text-gray-900">{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {type === 'residential' && 'Residential care homes'}
                        {type === 'nursing' && 'Nursing homes with medical care'}
                        {type === 'domiciliary' && 'Home care services'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="managerName">Manager Name *</Label>
                  <Input
                    id="managerName"
                    {...form.register("managerName")}
                    placeholder="Your full name"
                  />
                  {form.formState.errors.managerName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.managerName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    placeholder="manager@carehome.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="careHomeName">Facility Name *</Label>
                  <Input
                    id="careHomeName"
                    {...form.register("careHomeName")}
                    placeholder="Name of your care facility"
                  />
                  {form.formState.errors.careHomeName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.careHomeName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    {...form.register("contactPhone")}
                    placeholder="01234 567890"
                  />
                  {form.formState.errors.contactPhone && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPhone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    {...form.register("location")}
                    placeholder="City, County or Postcode"
                  />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="facilityCapacity">{config.capacityLabel} *</Label>
                  <Input
                    id="facilityCapacity"
                    type="number"
                    min="1"
                    {...form.register("facilityCapacity", { valueAsNumber: true })}
                    placeholder="Enter capacity"
                  />
                  {form.formState.errors.facilityCapacity && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.facilityCapacity.message}</p>
                  )}
                </div>
              </div>

              {/* Dynamic Fields Based on Care Setting Type */}
              {careSettingType === 'residential' && (
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Residential Care Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cqcRegistrationNumber">CQC Registration Number</Label>
                      <Input
                        id="cqcRegistrationNumber"
                        {...form.register("cqcRegistrationNumber")}
                        placeholder="1-000000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Specializations (Select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fieldOptions.specializations.map((spec) => (
                        <label key={spec} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('specializations') || [];
                              if (checked) {
                                form.setValue('specializations', [...current, spec]);
                              } else {
                                form.setValue('specializations', current.filter(s => s !== spec));
                              }
                            }}
                          />
                          <span className="text-sm">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("mealServices")} />
                      <span>Meal Services Provided</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("transportProvided")} />
                      <span>Transport Services Available</span>
                    </label>
                  </div>
                </div>
              )}

              {careSettingType === 'nursing' && (
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Nursing Home Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cqcRegistrationNumber">CQC Registration Number</Label>
                      <Input
                        id="cqcRegistrationNumber"
                        {...form.register("cqcRegistrationNumber")}
                        placeholder="1-000000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Medical Conditions Supported</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fieldOptions.medicalConditions.map((condition) => (
                        <label key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('medicalConditionsSupported') || [];
                              if (checked) {
                                form.setValue('medicalConditionsSupported', [...current, condition]);
                              } else {
                                form.setValue('medicalConditionsSupported', current.filter(s => s !== condition));
                              }
                            }}
                          />
                          <span className="text-sm">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Equipment Available</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {fieldOptions.equipment.map((equipment) => (
                        <label key={equipment} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('equipmentAvailable') || [];
                              if (checked) {
                                form.setValue('equipmentAvailable', [...current, equipment]);
                              } else {
                                form.setValue('equipmentAvailable', current.filter(s => s !== equipment));
                              }
                            }}
                          />
                          <span className="text-sm">{equipment}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("emergencyResponse")} />
                      <span>24/7 Emergency Response</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("nursingStaffRequired")} />
                      <span>Registered Nursing Staff Required</span>
                    </label>
                  </div>
                </div>
              )}

              {careSettingType === 'domiciliary' && (
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Domiciliary Care Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="operationalHours">Operational Hours</Label>
                      <Input
                        id="operationalHours"
                        {...form.register("operationalHours")}
                        placeholder="e.g., Mon-Sun 8am-8pm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Services Offered</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {fieldOptions.servicesOffered.map((service) => (
                        <label key={service} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('servicesOffered') || [];
                              if (checked) {
                                form.setValue('servicesOffered', [...current, service]);
                              } else {
                                form.setValue('servicesOffered', current.filter(s => s !== service));
                              }
                            }}
                          />
                          <span className="text-sm">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Client Age Groups</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {fieldOptions.clientAgeGroups.map((age) => (
                        <label key={age} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('clientAgeGroups') || [];
                              if (checked) {
                                form.setValue('clientAgeGroups', [...current, age]);
                              } else {
                                form.setValue('clientAgeGroups', current.filter(s => s !== age));
                              }
                            }}
                          />
                          <span className="text-sm">{age}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Service Areas</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {fieldOptions.serviceAreas.map((area) => (
                        <label key={area} className="flex items-center space-x-2">
                          <Checkbox
                            onCheckedChange={(checked) => {
                              const current = form.getValues('serviceAreas') || [];
                              if (checked) {
                                form.setValue('serviceAreas', [...current, area]);
                              } else {
                                form.setValue('serviceAreas', current.filter(s => s !== area));
                              }
                            }}
                          />
                          <span className="text-sm">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("transportProvided")} />
                      <span>Transport Services</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("localAuthorityContracts")} />
                      <span>Local Authority Contracts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox {...form.register("privatePayClients")} />
                      <span>Private Pay Clients</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Common Additional Fields */}
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="urgentStaffingNeeds">Urgent Staffing Needs</Label>
                    <Textarea
                      id="urgentStaffingNeeds"
                      {...form.register("urgentStaffingNeeds")}
                      placeholder="Describe any immediate staffing requirements..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentStaffingChallenges">Current Staffing Challenges</Label>
                    <Textarea
                      id="currentStaffingChallenges"
                      {...form.register("currentStaffingChallenges")}
                      placeholder="What staffing challenges are you facing?"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    {...form.register("additionalInfo")}
                    placeholder="Any additional information about your facility or requirements..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="promotionSource">How did you hear about our free first shift offer?</Label>
                  <Select onValueChange={(value) => form.setValue('promotionSource', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="google">Google Search</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Enquiry"}
                </Button>
                <Link href="/">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}