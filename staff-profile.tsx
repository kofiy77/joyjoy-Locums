import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Calendar, Clock, MapPin, Edit2, User, Lock, Bell, Settings, FileText, Shield, Camera, Upload, X, GraduationCap, MapPinIcon, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import CertificationManager from "./certification-manager";
import EnhancedDocumentComplianceTracker from "./EnhancedDocumentComplianceTracker";
import NotificationSettings from "./NotificationSettings";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import StaffHeader from "./StaffHeader";

const staffProfileSchema = z.object({
  role: z.string().min(1, "Role is required"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  postcode: z.string().min(1, "Postcode is required"),
  skills: z.string().optional(),
  bio: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  phone: z.string().optional(),
});

type StaffProfileData = z.infer<typeof staffProfileSchema>;

export default function StaffProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [location] = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Automatically switch to documents tab when coming from compliance navigation
  useEffect(() => {
    // Check if this is accessed via compliance navigation or URL contains compliance context
    const urlParams = new URLSearchParams(window.location.search);
    const fromCompliance = urlParams.get('tab') === 'compliance' || window.location.hash === '#compliance';
    
    if (fromCompliance) {
      setActiveSection("documents");
    }
  }, [location]);
  
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: false,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  // Fetch staff profile data first
  const { data: staffProfile, error, isLoading } = useQuery({
    queryKey: ["/api/staff/me"],
  });

  // Fetch existing documents to get profile picture
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: [`/api/documents/staff/${user?.id}`],
  });

  // Set profile picture from existing documents
  useEffect(() => {
    if (documents && Array.isArray(documents)) {
      const profilePic = documents.find((doc: any) => 
        doc.documentType === 'profile_picture' || 
        doc.storagePath?.includes('profile_picture')
      );
      if (profilePic) {
        setProfilePicture(profilePic.publicUrl);
      } else {
        setProfilePicture(null);
      }
    }
  }, [documents]);

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingPicture(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'profile_picture');
      formData.append('entityType', 'staff');
      formData.append('entityId', user?.id || '');

      const response = await apiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response && typeof response === 'object') {
        toast({
          title: "Success",
          description: "Profile picture uploaded successfully!",
        });
        
        // Refetch documents to update the display
        await refetchDocuments();
      }
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profilePicture) return;

    setIsUploadingPicture(true);

    try {
      const response = await apiRequest(`/api/documents/staff/${user?.id}/profile_picture`, {
        method: 'DELETE',
      });

      if (response && typeof response === 'object') {
        toast({
          title: "Success",
          description: "Profile picture deleted successfully!",
        });
        
        setProfilePicture(null);
        // Refetch documents to update the display
        await refetchDocuments();
      }
    } catch (error: any) {
      console.error('Profile picture delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  // Initialize form with default values
  const form = useForm<StaffProfileData>({
    defaultValues: {
      role: "healthcare_assistant",
      hourlyRate: "12.50",
      postcode: "M1 1AA",
      skills: "Dementia Care, Moving & Handling",
      bio: "Experienced healthcare assistant with passion for elderly care",
      address_line_1: "",
      address_line_2: "",
      city: "",
      county: "",
      phone: "",
    }
  });

  // Update form values when staffProfile data loads
  useEffect(() => {
    if (staffProfile && typeof staffProfile === 'object') {
      const profileData = staffProfile as any; // Type assertion for dynamic data
      form.reset({
        role: profileData.role || "healthcare_assistant",
        hourlyRate: profileData.hourly_rate || "12.50",
        postcode: profileData.postcode || "M1 1AA",
        skills: profileData.additional_skills || "Dementia Care, Moving & Handling",
        bio: profileData.bio || "Experienced healthcare assistant with passion for elderly care",
        address_line_1: profileData.address_line_1 || "",
        address_line_2: profileData.address_line_2 || "",
        city: profileData.city || "",
        county: profileData.county || "",
        phone: profileData.phone || "",
      });
    }
  }, [staffProfile, form]);

  // Show error state if profile fetch fails
  if (error) {
    console.error('Staff profile error:', error);
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: StaffProfileData) => {
      return apiRequest("/api/staff/me", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/me"] });
      if (user?.type === 'staff') {
        setIsEditMode(false);
      }
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      return apiRequest("/api/staff/availability", {
        method: "POST",
        body: JSON.stringify({ isAvailable }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Availability Updated",
        description: "Your availability status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/me"] });
    },
  });

  const onSubmit = (data: StaffProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const toggleDay = (day: keyof typeof availability) => {
    setAvailability(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Sidebar menu items
  const menuItems = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'professional', label: 'Professional Details', icon: UserRound },
    { id: 'documents', label: 'Compliance Credentials', icon: Shield },
    { id: 'availability', label: 'Availability & Rate', icon: Calendar },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'password', label: 'Change Password', icon: Lock },
  ];

  return (
    <>
      <StaffHeader />
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                      ${activeSection === item.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeSection === 'personal' && (
            <PersonalDetailsSection 
              user={user}
              staffProfile={staffProfile}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              form={form}
              onSubmit={onSubmit}
              updateProfileMutation={updateProfileMutation}
              profilePicture={profilePicture}
              isUploadingPicture={isUploadingPicture}
              handleProfilePictureUpload={handleProfilePictureUpload}
              handleDeleteProfilePicture={handleDeleteProfilePicture}
            />
          )}

          {activeSection === 'professional' && (
            <ProfessionalDetailsSection 
              user={user}
              staffProfile={staffProfile}
            />
          )}

          {activeSection === 'documents' && (
            <DocumentsSection />
          )}

          {activeSection === 'availability' && (
            <AvailabilitySection 
              availability={availability}
              toggleDay={toggleDay}
            />
          )}

          {activeSection === 'notifications' && (
            <NotificationSettingsSection />
          )}

          {activeSection === 'password' && (
            <PasswordSecuritySection />
          )}
        </div>
      </div>
    </>
  );
}

// Personal Details Section Component
function PersonalDetailsSection({ 
  user, 
  staffProfile, 
  isEditMode, 
  setIsEditMode, 
  form, 
  onSubmit, 
  updateProfileMutation,
  profilePicture,
  isUploadingPicture,
  handleProfilePictureUpload,
  handleDeleteProfilePicture
}: any) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Personal Details</h1>
        <Button
          onClick={() => setIsEditMode(!isEditMode)}
          variant={isEditMode ? "outline" : "default"}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditMode ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Profile Photo and Basic Info */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {/* Upload button overlay */}
              <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                {isUploadingPicture ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-gray-600" />
                )}
              </label>
              
              {/* Delete button - only show when profile picture exists */}
              {profilePicture && (
                <button
                  onClick={handleDeleteProfilePicture}
                  disabled={isUploadingPicture}
                  className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                  title="Delete profile picture"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
              
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={isUploadingPicture}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="mr-2">
                  {(staffProfile as any)?.role || 'Healthcare Assistant'}
                </Badge>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={user?.firstName || ''}
                    disabled={!isEditMode}
                    className={!isEditMode ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={user?.lastName || ''}
                    disabled={!isEditMode}
                    className={!isEditMode ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled={!isEditMode}
                    className={!isEditMode ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+44 7XXX XXXXXX"
                    {...form.register("phone")}
                    disabled={!isEditMode}
                    className={!isEditMode ? 'bg-gray-50' : ''}
                  />
                </div>

              </div>
            </div>

            {/* Home Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Address</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="address_line_1">Address Line 1</Label>
                  <Input
                    id="address_line_1"
                    placeholder="House number and street name"
                    {...form.register("address_line_1")}
                    disabled={!isEditMode}
                    className={!isEditMode ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
                  <Input
                    id="address_line_2"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    {...form.register("address_line_2")}
                    disabled={!isEditMode}
                    className={!isEditMode ? 'bg-gray-50' : ''}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City/Town</Label>
                    <Input
                      id="city"
                      placeholder="e.g. London"
                      {...form.register("city")}
                      disabled={!isEditMode}
                      className={!isEditMode ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      placeholder="e.g. Greater London"
                      {...form.register("county")}
                      disabled={!isEditMode}
                      className={!isEditMode ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="e.g. SW1A 1AA"
                      {...form.register("postcode")}
                      disabled={!isEditMode}
                      className={!isEditMode ? 'bg-gray-50' : ''}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Input
                id="bio"
                placeholder="Brief description of your experience and specialties"
                {...form.register("bio")}
                disabled={!isEditMode}
                className={!isEditMode ? 'bg-gray-50' : ''}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills & Specializations</Label>
              <Input
                id="skills"
                placeholder="e.g. Dementia Care, Moving & Handling, Safeguarding"
                {...form.register("skills")}
                disabled={!isEditMode}
                className={!isEditMode ? 'bg-gray-50' : ''}
              />
            </div>

            {isEditMode && (
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Availability Section Component
function AvailabilitySection({ availability, toggleDay }: any) {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Availability Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{day.label}</span>
              </div>
              <Switch
                checked={availability[day.key as keyof typeof availability]}
                onCheckedChange={() => toggleDay(day.key as keyof typeof availability)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Password & Security Section Component
function PasswordSecuritySection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Password & Security</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Login Notifications</h4>
              <p className="text-sm text-gray-600">Get notified of new sign-ins</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Notification Settings Section Component
function NotificationSettingsSection() {
  return (
    <div className="space-y-6">
      <NotificationSettings />
    </div>
  );
}

// Professional Details Section Component
function ProfessionalDetailsSection({ user, staffProfile }: any) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Professional details form schema
  const professionalSchema = z.object({
    gmc_number: z.string().optional(),
    psni_number: z.string().optional(),
    psi_number: z.string().optional(),
    is_pre_registration: z.boolean().optional(),
    university: z.string().optional(),
    graduation_year: z.string().optional(),
    nationality: z.string().optional(),
    experience_years: z.number().min(0, "Experience must be positive").optional(),
    health_care_visa: z.enum(['yes', 'no']).optional(),
    criminal_record: z.enum(['yes', 'no']).optional(),
    under_investigation: z.enum(['yes', 'no']).optional(),
  });

  type ProfessionalData = z.infer<typeof professionalSchema>;

  const professionalForm = useForm<ProfessionalData>({
    defaultValues: {
      gmc_number: "",
      psni_number: "",
      psi_number: "",
      is_pre_registration: false,
      university: "",
      graduation_year: "",
      nationality: "",
      experience_years: 0,
      health_care_visa: 'no',
      criminal_record: 'no',
      under_investigation: 'no',
    }
  });

  // Update form when staffProfile loads
  useEffect(() => {
    if (staffProfile && typeof staffProfile === 'object') {
      const profile = staffProfile as any;
      professionalForm.reset({
        gmc_number: profile.gmc_number || "",
        psni_number: profile.psni_number || "",
        psi_number: profile.psi_number || "",
        is_pre_registration: profile.is_pre_registration || false,
        university: profile.university || "",
        graduation_year: profile.graduation_year || "",
        nationality: profile.nationality || "",
        experience_years: profile.experience || profile.experience_years || 0,
        health_care_visa: profile.health_care_visa || 'no',
        criminal_record: profile.criminal_record || 'no',
        under_investigation: profile.under_investigation || 'no',
      });
    }
  }, [staffProfile, professionalForm]);

  const updateProfessionalMutation = useMutation({
    mutationFn: async (data: ProfessionalData) => {
      return apiRequest("/api/staff/professional-details", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Professional Details Updated",
        description: "Your professional information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/me"] });
      setIsEditMode(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your professional details.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfessionalData) => {
    updateProfessionalMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Professional Details</h1>
        <Button
          onClick={() => setIsEditMode(!isEditMode)}
          variant={isEditMode ? "outline" : "default"}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditMode ? 'Cancel' : 'Edit Details'}
        </Button>
      </div>

      <form onSubmit={professionalForm.handleSubmit(onSubmit)} className="space-y-8">
        {/* Registration Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              Registration Details
              <AlertCircle className="h-4 w-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gmc_number">GPHC (England/Scotland/Wales)</Label>
                <Input
                  id="gmc_number"
                  placeholder="e.g., 2062186"
                  {...professionalForm.register("gmc_number")}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="psni_number">PSNI Number (Northern Ireland)</Label>
                <Input
                  id="psni_number"
                  placeholder="Enter PSNI registration number"
                  {...professionalForm.register("psni_number")}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="psi_number">PSI Number (Republic of Ireland)</Label>
                <Input
                  id="psi_number"
                  placeholder="Enter PSI registration number"
                  {...professionalForm.register("psi_number")}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label>I'm Pre-Registration</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_pre_registration"
                    checked={professionalForm.watch("is_pre_registration")}
                    onCheckedChange={(checked) => 
                      professionalForm.setValue("is_pre_registration", checked as boolean)
                    }
                    disabled={!isEditMode}
                  />
                  <Label htmlFor="is_pre_registration" className="text-sm font-normal">
                    Check if you are currently in pre-registration
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="university">University / Educational Organisation</Label>
                <Input
                  id="university"
                  placeholder="e.g., Leicester School Of Pharmacy, UK"
                  {...professionalForm.register("university")}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Year of Graduation</Label>
                <Input
                  id="graduation_year"
                  placeholder="e.g., 2003"
                  {...professionalForm.register("graduation_year")}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  {...professionalForm.register("experience_years", { valueAsNumber: true })}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right to Work */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              Right to Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  placeholder="e.g., British"
                  {...professionalForm.register("nationality")}
                  disabled={!isEditMode}
                  className={!isEditMode ? 'bg-gray-50' : ''}
                />
              </div>

              <div className="space-y-3">
                <Label>Do you have a Health and Care Worker or Skilled Worker visa (formerly Tier 2)?</Label>
                <RadioGroup
                  value={professionalForm.watch("health_care_visa") || 'no'}
                  onValueChange={(value) => 
                    professionalForm.setValue("health_care_visa", value as 'yes' | 'no')
                  }
                  disabled={!isEditMode}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="visa_yes" />
                    <Label htmlFor="visa_yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="visa_no" />
                    <Label htmlFor="visa_no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label>Do you have a criminal record?</Label>
                <RadioGroup
                  value={professionalForm.watch("criminal_record") || 'no'}
                  onValueChange={(value) => 
                    professionalForm.setValue("criminal_record", value as 'yes' | 'no')
                  }
                  disabled={!isEditMode}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="criminal_yes" />
                    <Label htmlFor="criminal_yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="criminal_no" />
                    <Label htmlFor="criminal_no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Are you under investigation by a registration body?</Label>
                <RadioGroup
                  value={professionalForm.watch("under_investigation") || 'no'}
                  onValueChange={(value) => 
                    professionalForm.setValue("under_investigation", value as 'yes' | 'no')
                  }
                  disabled={!isEditMode}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="investigation_yes" />
                    <Label htmlFor="investigation_yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="investigation_no" />
                    <Label htmlFor="investigation_no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditMode && (
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfessionalMutation.isPending}>
              {updateProfessionalMutation.isPending ? 'Saving...' : 'Save Professional Details'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

// Documents Section Component
function DocumentsSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Medical Compliance & Documents</h1>
      <EnhancedDocumentComplianceTracker />
    </div>
  );
}