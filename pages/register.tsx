import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, HeartHandshake, UserPlus, Shield, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  postcode: z.string().min(5, "Valid UK postcode required"),
  professionalType: z.enum(["gp", "nurse_practitioner", "clinical_pharmacist"], {
    errorMap: () => ({ message: "Please select your professional type" })
  }),
  gmcNumber: z.string().optional(),
  nmcNumber: z.string().optional(),
  gphcNumber: z.string().optional(),
  yearsExperience: z.number().min(0, "Years of experience must be 0 or greater"),
  specializations: z.array(z.string()).min(1, "Please select at least one specialization"),
  availability: z.array(z.string()).min(1, "Please select your availability"),
  consentGMCCheck: z.boolean().refine(val => val === true, "You must consent to GMC/NMC/GPhC verification"),
  consentIndemnityCheck: z.boolean().refine(val => val === true, "You must consent to indemnity verification"),
  consentUmbrellaCompany: z.boolean().refine(val => val === true, "You must consent to use our preferred umbrella company"),
  agreeTerms: z.boolean().refine(val => val === true, "You must agree to terms and conditions"),
}).refine((data) => {
  if (data.professionalType === "gp" && !data.gmcNumber) {
    return false;
  }
  if (data.professionalType === "nurse_practitioner" && !data.nmcNumber) {
    return false;
  }
  if (data.professionalType === "clinical_pharmacist" && !data.gphcNumber) {
    return false;
  }
  return true;
}, {
  message: "Professional registration number is required",
  path: ["gmcNumber"]
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [professionalType, setProfessionalType] = useState<"gp" | "nurse_practitioner" | "clinical_pharmacist">("gp");
  const { toast } = useToast();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      postcode: "",
      professionalType: "gp" as const,
      gmcNumber: "",
      nmcNumber: "",
      gphcNumber: "",
      yearsExperience: 0,
      specializations: [],
      availability: [],
      consentGMCCheck: false,
      consentIndemnityCheck: false,
      consentUmbrellaCompany: false,
      agreeTerms: false,
    },
  });

  const gpSpecializations = [
    "General Practice",
    "Emergency Medicine",
    "Out of Hours",
    "Walk-in Clinics",
    "Minor Surgery",
    "Family Planning",
    "Travel Medicine",
    "Occupational Health"
  ];

  const npSpecializations = [
    "Primary Care",
    "Urgent Care",
    "Minor Illness",
    "Chronic Disease Management",
    "Women's Health",
    "Men's Health",
    "Pediatrics",
    "Geriatrics"
  ];

  const availabilityOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const onSubmit = async (data: RegistrationData) => {
    // Enhanced email validation before submission
    if (!data.email || !data.email.trim()) {
      toast({
        title: "Email Required",
        description: "Please provide a valid email address before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address format.",
        variant: "destructive",
      });
      return;
    }

    // Validate all required consents before submission
    if (!data.consentGMCCheck || !data.consentIndemnityCheck || !data.consentUmbrellaCompany || !data.agreeTerms) {
      toast({
        title: "Consent Required",
        description: "All consent agreements must be accepted before registration.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        ...data,
        specializations: selectedSpecializations,
        availability: selectedAvailability,
        role: data.professionalType === "gp" ? "GP" : data.professionalType === "nurse_practitioner" ? "Nurse Practitioner" : "Clinical Pharmacist",
        registrationSource: "website",
        consentTimestamp: new Date().toISOString(),
      };

      await apiRequest("/api/register", {
        method: "POST",
        body: JSON.stringify(registrationData),
      });

      toast({
        title: "Registration Successful!",
        description: "Welcome to JoyJoy Locums. Redirecting to confirmation page...",
      });

      // Redirect to success page after short delay
      setTimeout(() => {
        window.location.href = '/registration-success';
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const updated = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter(s => s !== spec)
      : [...selectedSpecializations, spec];
    setSelectedSpecializations(updated);
    form.setValue("specializations", updated);
  };

  const toggleAvailability = (day: string) => {
    const updated = selectedAvailability.includes(day)
      ? selectedAvailability.filter(d => d !== day)
      : [...selectedAvailability, day];
    setSelectedAvailability(updated);
    form.setValue("availability", updated);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, var(--medical-blue-50) 0%, var(--medical-blue-100) 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" style={{ color: 'var(--medical-blue-600)' }} className="hover:bg-white/50 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center" style={{ color: 'var(--header-blue)' }}>
              <HeartHandshake className="h-12 w-12 mr-3" />
              <span className="text-3xl font-bold">JoyJoy Locums</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--header-blue)' }}>
            Join Our Medical Network
          </h1>
          <p className="text-xl text-gray-600">
            Register as a GP, Nurse Practitioner, or Clinical Pharmacist to access premium locum opportunities
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6" style={{ backgroundColor: 'var(--medical-blue-50)' }}>
            <CardTitle className="text-2xl" style={{ color: 'var(--header-blue)' }}>
              Professional Registration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Complete your profile to start receiving locum opportunities
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email", {
                        onChange: (e) => {
                          // Real-time email validation feedback
                          const email = e.target.value;
                          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            form.setError("email", {
                              type: "pattern",
                              message: "Please enter a valid email format (e.g., name@example.com)"
                            });
                          } else {
                            form.clearErrors("email");
                          }
                        }
                      })}
                      className="mt-1"
                      placeholder="e.g., doctor@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                    {form.watch("email") && !form.formState.errors.email && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Valid email format
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      className="mt-1"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...form.register("dateOfBirth")}
                      className="mt-1"
                      max={new Date(new Date().getFullYear() - 18, 11, 31).toISOString().split('T')[0]}
                      min={new Date(new Date().getFullYear() - 80, 0, 1).toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Click on the year to quickly navigate to your birth year
                    </p>
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      {...form.register("postcode")}
                      className="mt-1"
                      placeholder="e.g. SW1A 1AA"
                    />
                    {form.formState.errors.postcode && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.postcode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Professional Information
                </h3>
                
                <div>
                  <Label className="text-base font-medium">Professional Type *</Label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="professional-gp"
                        name="professionalType"
                        value="gp"
                        checked={professionalType === "gp"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfessionalType("gp");
                            form.setValue("professionalType", "gp");
                            setSelectedSpecializations([]); // Clear specializations when changing type
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="professional-gp" className="text-sm font-medium cursor-pointer">
                        General Practitioner (GP)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="professional-np"
                        name="professionalType"
                        value="nurse_practitioner"
                        checked={professionalType === "nurse_practitioner"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfessionalType("nurse_practitioner");
                            form.setValue("professionalType", "nurse_practitioner");
                            setSelectedSpecializations([]); // Clear specializations when changing type
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="professional-np" className="text-sm font-medium cursor-pointer">
                        Advanced Nurse Practitioner (ANP)
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="professional-pharmacist"
                        name="professionalType"
                        value="clinical_pharmacist"
                        checked={professionalType === "clinical_pharmacist"}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfessionalType("clinical_pharmacist");
                            form.setValue("professionalType", "clinical_pharmacist");
                            setSelectedSpecializations([]); // Clear specializations when changing type
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="professional-pharmacist" className="text-sm font-medium cursor-pointer">
                        Clinical Pharmacist
                      </Label>
                    </div>
                  </div>
                  {form.formState.errors.professionalType && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.professionalType.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionalType === "gp" && (
                    <div>
                      <Label htmlFor="gmcNumber">GMC Number *</Label>
                      <Input
                        id="gmcNumber"
                        {...form.register("gmcNumber")}
                        className="mt-1"
                        placeholder="e.g. 1234567"
                      />
                      {form.formState.errors.gmcNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.gmcNumber.message}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {professionalType === "nurse_practitioner" && (
                    <div>
                      <Label htmlFor="nmcNumber">NMC Number *</Label>
                      <Input
                        id="nmcNumber"
                        {...form.register("nmcNumber")}
                        className="mt-1"
                        placeholder="e.g. 12A3456E"
                      />
                      {form.formState.errors.nmcNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.nmcNumber.message}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {professionalType === "clinical_pharmacist" && (
                    <div>
                      <Label htmlFor="gphcNumber">GPhC Number *</Label>
                      <Input
                        id="gphcNumber"
                        {...form.register("gphcNumber")}
                        className="mt-1"
                        placeholder="e.g. 2123456"
                      />
                      {form.formState.errors.gphcNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.gphcNumber.message}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience *</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      {...form.register("yearsExperience", { valueAsNumber: true })}
                      className="mt-1"
                    />
                    {form.formState.errors.yearsExperience && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.yearsExperience.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specializations */}
              {professionalType && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--header-blue)' }}>
                    Specializations *
                  </h3>
                  <p className="text-sm text-gray-600">Select your areas of expertise (choose at least one)</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(professionalType === "gp" ? gpSpecializations : npSpecializations).map((spec) => (
                      <div
                        key={spec}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSpecializations.includes(spec)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleSpecialization(spec)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 border-2 rounded ${
                            selectedSpecializations.includes(spec)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedSpecializations.includes(spec) && (
                              <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className="text-sm font-medium">{spec}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.specializations && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.specializations.message}
                    </p>
                  )}
                </div>
              )}

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Availability *
                </h3>
                <p className="text-sm text-gray-600">Select the days you're available for locum work</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {availabilityOptions.map((day) => (
                    <div
                      key={day}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                        selectedAvailability.includes(day)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleAvailability(day)}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`w-4 h-4 border-2 rounded ${
                          selectedAvailability.includes(day)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedAvailability.includes(day) && (
                            <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span className="text-sm font-medium">{day}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {form.formState.errors.availability && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.availability.message}
                  </p>
                )}
              </div>

              {/* Consent and Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--header-blue)' }}>
                  Verification & Terms
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentGMCCheck"
                      checked={form.watch("consentGMCCheck")}
                      onCheckedChange={(checked) => form.setValue("consentGMCCheck", !!checked)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="consentGMCCheck" className="text-sm font-medium">
                        Professional Registration Verification *
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        I consent to JoyJoy Locums verifying my {professionalType === "gp" ? "GMC" : "NMC"} registration and professional standing
                      </p>
                    </div>
                  </div>
                  {form.formState.errors.consentGMCCheck && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.consentGMCCheck.message}
                    </p>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentIndemnityCheck"
                      checked={form.watch("consentIndemnityCheck")}
                      onCheckedChange={(checked) => form.setValue("consentIndemnityCheck", !!checked)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="consentIndemnityCheck" className="text-sm font-medium">
                        Indemnity Insurance Verification *
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        I consent to JoyJoy Locums verifying my professional indemnity insurance coverage
                      </p>
                    </div>
                  </div>
                  {form.formState.errors.consentIndemnityCheck && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.consentIndemnityCheck.message}
                    </p>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentUmbrellaCompany"
                      checked={form.watch("consentUmbrellaCompany")}
                      onCheckedChange={(checked) => form.setValue("consentUmbrellaCompany", !!checked)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="consentUmbrellaCompany" className="text-sm font-medium">
                        Preferred Umbrella Company Agreement *
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        I consent to use JoyJoy Care's preferred UK umbrella company (PayStream) for payment processing and employment services.{" "}
                        <Link href="/paystream-terms" className="text-blue-600 hover:text-blue-800 underline">
                          View PayStream Terms & Conditions
                        </Link>
                      </p>
                    </div>
                  </div>
                  {form.formState.errors.consentUmbrellaCompany && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.consentUmbrellaCompany.message}
                    </p>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeTerms"
                      checked={form.watch("agreeTerms")}
                      onCheckedChange={(checked) => form.setValue("agreeTerms", !!checked)}
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="agreeTerms" className="text-sm font-medium">
                        Terms and Conditions *
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        I agree to the{" "}
                        <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>
                  {form.formState.errors.agreeTerms && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.agreeTerms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full py-4 text-lg font-semibold text-white"
                  style={{ backgroundColor: 'var(--medical-blue-600)' }}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Registration...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Already registered?{" "}
            <Link href="/auth" className="font-medium hover:underline" style={{ color: 'var(--medical-blue-600)' }}>
              Sign in to your account
            </Link>
          </p>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--header-blue)' }}>
              What happens next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Verification</p>
                  <p>We'll verify your professional registration and credentials</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Profile Review</p>
                  <p>Our team will review your application within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Start Working</p>
                  <p>Once approved, you'll receive locum opportunities immediately</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}