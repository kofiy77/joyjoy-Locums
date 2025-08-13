import { useState } from "react";
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
import { ArrowLeft, Stethoscope, Mail, Phone, MapPin, Users, Clock, Star, Building, Shield, Heart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// GP Practice enquiry schema
const practiceEnquirySchema = z.object({
  practiceManagerName: z.string().min(1, "Practice manager name is required"),
  email: z.string().email("Valid email address is required"),
  practiceName: z.string().min(1, "Practice name is required"),
  address: z.string().min(1, "Practice address is required"),
  postcode: z.string().min(1, "Postcode is required"),
  contactPhone: z.string().min(10, "Valid phone number is required"),
  practiceType: z.enum(["single_handed", "group_practice", "health_centre", "urgent_care", "walk_in_centre"]),
  patientListSize: z.number().min(1, "Patient list size must be at least 1"),
  servicesOffered: z.array(z.string()).optional(),
  specialtyServices: z.array(z.string()).optional(),
  cqcRating: z.enum(["outstanding", "good", "requires_improvement", "inadequate", "not_rated"]).optional(),
  nhsContractType: z.enum(["gms", "pms", "apms"]).optional(),
  operatingHours: z.string().optional(),
  extendedHours: z.boolean().optional(),
  onlineConsultations: z.boolean().optional(),
  homeVisits: z.boolean().optional(),
  chronicDiseaseManagement: z.boolean().optional(),
  vaccinationServices: z.boolean().optional(),
  minorSurgery: z.boolean().optional(),
  familyPlanning: z.boolean().optional(),
  travelHealth: z.boolean().optional(),
  occupationalHealth: z.boolean().optional(),
  urgentLocumNeeds: z.string().optional(),
  currentStaffingChallenges: z.string().optional(),
  preferredSessionTypes: z.array(z.string()).optional(),
  additionalRequirements: z.string().optional(),
  promotionSource: z.string().optional(),
});

type PracticeEnquiryData = z.infer<typeof practiceEnquirySchema>;

// Practice type configurations
const practiceTypeConfig = {
  single_handed: {
    title: "Single-Handed GP Practice",
    subtitle: "Professional locum support for single-handed practices",
    icon: Stethoscope,
    description: "Connect with qualified GPs and Nurse Practitioners for your practice",
    capacityLabel: "Patient List Size"
  },
  group_practice: {
    title: "Group GP Practice", 
    subtitle: "Comprehensive locum solutions for group practices",
    icon: Building,
    description: "Access experienced locums for your multi-doctor practice",
    capacityLabel: "Patient List Size"
  },
  health_centre: {
    title: "Health Centre",
    subtitle: "Specialized staffing for health centres", 
    icon: Shield,
    description: "Find qualified medical professionals for your health centre",
    capacityLabel: "Patient List Size"
  },
  urgent_care: {
    title: "Urgent Care Centre",
    subtitle: "Emergency locum coverage solutions",
    icon: Heart,
    description: "Rapid access to urgent care specialists and GPs",
    capacityLabel: "Daily Patient Capacity"
  },
  walk_in_centre: {
    title: "Walk-in Centre",
    subtitle: "Flexible staffing for walk-in services",
    icon: Users,
    description: "Connect with locums experienced in walk-in centre environments",
    capacityLabel: "Daily Patient Capacity"
  }
};

// Field options for medical practices
const fieldOptions = {
  servicesOffered: [
    "General Medical Services",
    "Emergency Appointments",
    "Chronic Disease Management",
    "Health Screening",
    "Vaccinations & Immunisations",
    "Minor Surgery",
    "Family Planning",
    "Maternity Services",
    "Child Health Services",
    "Mental Health Support",
    "Travel Health",
    "Occupational Health"
  ],
  specialtyServices: [
    "Cardiology",
    "Dermatology", 
    "Diabetes Care",
    "Respiratory Medicine",
    "Women's Health",
    "Men's Health",
    "Geriatric Medicine",
    "Paediatrics",
    "Mental Health",
    "Substance Misuse",
    "Learning Disabilities",
    "Palliative Care"
  ],
  preferredSessionTypes: [
    "Morning Sessions (AM)",
    "Afternoon Sessions (PM)",
    "Evening Sessions",
    "Saturday Sessions",
    "Emergency Cover",
    "Home Visit Sessions",
    "Telephone Consultations",
    "Video Consultations"
  ]
};

export default function GPPracticeEnquiry() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPracticeType, setSelectedPracticeType] = useState<string>("single_handed");

  const form = useForm<PracticeEnquiryData>({
    resolver: zodResolver(practiceEnquirySchema),
    defaultValues: {
      practiceType: "single_handed",
      servicesOffered: [],
      specialtyServices: [],
      preferredSessionTypes: [],
      extendedHours: false,
      onlineConsultations: false,
      homeVisits: false,
      chronicDiseaseManagement: false,
      vaccinationServices: false,
      minorSurgery: false,
      familyPlanning: false,
      travelHealth: false,
      occupationalHealth: false,
    },
  });

  const currentConfig = practiceTypeConfig[selectedPracticeType as keyof typeof practiceTypeConfig];
  const IconComponent = currentConfig.icon;

  const onSubmit = async (data: PracticeEnquiryData) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("/api/gp-practice-enquiry", "POST", data);
      
      if (response.ok) {
        toast({
          title: "Enquiry Submitted Successfully",
          description: "We'll contact you within 24 hours to discuss your locum requirements.",
        });
        form.reset();
      } else {
        throw new Error("Failed to submit enquiry");
      }
    } catch (error) {
      console.error("Enquiry submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceToggle = (service: string, field: "servicesOffered" | "specialtyServices" | "preferredSessionTypes") => {
    const currentValues = form.getValues(field) || [];
    const updatedValues = currentValues.includes(service)
      ? currentValues.filter((s) => s !== service)
      : [...currentValues, service];
    form.setValue(field, updatedValues);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-blue-700 hover:text-blue-900 hover:bg-blue-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <IconComponent className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {currentConfig.title}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {currentConfig.subtitle}
            </p>
            <p className="text-gray-500">
              {currentConfig.description}
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Practice Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5 text-blue-600" />
                  Practice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="practiceType" className="text-base font-medium">
                    Select Your Practice Type
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {Object.entries(practiceTypeConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <div
                          key={key}
                          className={`relative cursor-pointer border-2 rounded-lg p-4 text-center transition-all ${
                            selectedPracticeType === key
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={() => {
                            setSelectedPracticeType(key);
                            form.setValue("practiceType", key as any);
                          }}
                        >
                          <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h3 className="font-semibold text-sm text-gray-900">
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {config.capacityLabel}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="practiceManagerName">Practice Manager Name *</Label>
                    <Input
                      id="practiceManagerName"
                      placeholder="Your full name"
                      {...form.register("practiceManagerName")}
                      className="mt-1"
                    />
                    {form.formState.errors.practiceManagerName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.practiceManagerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="manager@practice.nhs.uk"
                      {...form.register("email")}
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="practiceName">Practice Name *</Label>
                    <Input
                      id="practiceName"
                      placeholder="e.g., Highfield Medical Centre"
                      {...form.register("practiceName")}
                      className="mt-1"
                    />
                    {form.formState.errors.practiceName && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.practiceName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="0121 123 4567"
                      {...form.register("contactPhone")}
                      className="mt-1"
                    />
                    {form.formState.errors.contactPhone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.contactPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Practice Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 High Street, Birmingham"
                      {...form.register("address")}
                      className="mt-1"
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="B1 1AA"
                      {...form.register("postcode")}
                      className="mt-1"
                    />
                    {form.formState.errors.postcode && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.postcode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="patientListSize">{currentConfig.capacityLabel} *</Label>
                    <Input
                      id="patientListSize"
                      type="number"
                      placeholder="e.g., 8500"
                      {...form.register("patientListSize", { valueAsNumber: true })}
                      className="mt-1"
                    />
                    {form.formState.errors.patientListSize && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.patientListSize.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nhsContractType">NHS Contract Type</Label>
                    <Select onValueChange={(value) => form.setValue("nhsContractType", value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gms">GMS (General Medical Services)</SelectItem>
                        <SelectItem value="pms">PMS (Personal Medical Services)</SelectItem>
                        <SelectItem value="apms">APMS (Alternative Provider Medical Services)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cqcRating">CQC Rating</Label>
                    <Select onValueChange={(value) => form.setValue("cqcRating", value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select CQC rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outstanding">Outstanding</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="requires_improvement">Requires Improvement</SelectItem>
                        <SelectItem value="inadequate">Inadequate</SelectItem>
                        <SelectItem value="not_rated">Not Yet Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Offered */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="mr-2 h-5 w-5 text-blue-600" />
                  Services & Specialties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">General Services Offered</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {fieldOptions.servicesOffered.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={form.getValues("servicesOffered")?.includes(service) || false}
                          onCheckedChange={() => handleServiceToggle(service, "servicesOffered")}
                        />
                        <Label
                          htmlFor={`service-${service}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Specialty Services</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {fieldOptions.specialtyServices.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={`specialty-${specialty}`}
                          checked={form.getValues("specialtyServices")?.includes(specialty) || false}
                          onCheckedChange={() => handleServiceToggle(specialty, "specialtyServices")}
                        />
                        <Label
                          htmlFor={`specialty-${specialty}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Additional Service Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    {[
                      { key: "extendedHours", label: "Extended Hours (evenings/weekends)" },
                      { key: "onlineConsultations", label: "Online Consultations" },
                      { key: "homeVisits", label: "Home Visits" },
                      { key: "chronicDiseaseManagement", label: "Chronic Disease Management" },
                      { key: "vaccinationServices", label: "Vaccination Services" },
                      { key: "minorSurgery", label: "Minor Surgery" },
                      { key: "familyPlanning", label: "Family Planning" },
                      { key: "travelHealth", label: "Travel Health" },
                      { key: "occupationalHealth", label: "Occupational Health" },
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature.key}
                          checked={form.getValues(feature.key as any) || false}
                          onCheckedChange={(checked) => form.setValue(feature.key as any, checked)}
                        />
                        <Label htmlFor={feature.key} className="text-sm font-normal cursor-pointer">
                          {feature.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Locum Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Locum Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Preferred Session Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {fieldOptions.preferredSessionTypes.map((session) => (
                      <div key={session} className="flex items-center space-x-2">
                        <Checkbox
                          id={`session-${session}`}
                          checked={form.getValues("preferredSessionTypes")?.includes(session) || false}
                          onCheckedChange={() => handleServiceToggle(session, "preferredSessionTypes")}
                        />
                        <Label
                          htmlFor={`session-${session}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {session}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    placeholder="e.g., Monday-Friday 8:00-18:30, Saturday 8:00-12:00"
                    {...form.register("operatingHours")}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="urgentLocumNeeds">Urgent Locum Needs</Label>
                  <Textarea
                    id="urgentLocumNeeds"
                    placeholder="Describe any immediate or urgent locum requirements..."
                    {...form.register("urgentLocumNeeds")}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="currentStaffingChallenges">Current Staffing Challenges</Label>
                  <Textarea
                    id="currentStaffingChallenges"
                    placeholder="Tell us about your current staffing challenges and how we can help..."
                    {...form.register("currentStaffingChallenges")}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="additionalRequirements">Additional Requirements</Label>
                  <Textarea
                    id="additionalRequirements"
                    placeholder="Any additional information about your practice or specific requirements..."
                    {...form.register("additionalRequirements")}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="promotionSource">How did you hear about us?</Label>
                  <Select onValueChange={(value) => form.setValue("promotionSource", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_search">Google Search</SelectItem>
                      <SelectItem value="colleague_referral">Colleague Referral</SelectItem>
                      <SelectItem value="medical_journal">Medical Journal</SelectItem>
                      <SelectItem value="conference">Medical Conference</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="other_social">Other Social Media</SelectItem>
                      <SelectItem value="email_campaign">Email Campaign</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Practice Enquiry"}
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                We'll review your enquiry and contact you within 24 hours to discuss your locum requirements.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}