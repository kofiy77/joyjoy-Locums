import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, UserPlus } from "lucide-react";

interface CreatePracticeManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCareHomeManagerDialog({ open, onOpenChange }: CreatePracticeManagerDialogProps) {
  const { toast } = useToast();
  const [selectedPracticeId, setSelectedPracticeId] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    practiceId: "",
    practiceName: "",
    facilityType: "residential",
    address: "",
    postcode: "",
    mainPhone: "",
    primaryContactRole: "",
    notes: ""
  });

  // Fetch existing practices
  const { data: practices = [] } = useQuery({
    queryKey: ['/api/admin/practices'],
    enabled: open
  });

  // Auto-populate practice details when selection changes
  useEffect(() => {
    if (selectedPracticeId && Array.isArray(practices)) {
      const selectedPractice = practices.find((p: any) => p.id === selectedPracticeId);
      if (selectedPractice) {
        setFormData(prev => ({
          ...prev,
          practiceId: selectedPractice.id,
          practiceName: selectedPractice.name,
          facilityType: selectedPractice.facilityType || "gp_practice",
          address: selectedPractice.address || "",
          postcode: selectedPractice.postcode || "",
          mainPhone: selectedPractice.mainPhone || ""
        }));
      }
    }
  }, [selectedPracticeId, practices]);

  const createManagerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin/practice-managers', 'POST', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Practice Manager Created",
        description: `Account created for ${formData.firstName} ${formData.lastName}. Credentials have been sent via email.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/practices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create practice manager account",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPracticeId("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      practiceId: "",
      practiceName: "",
      facilityType: "gp_practice",
      address: "",
      postcode: "",
      mainPhone: "",
      primaryContactRole: "",
      notes: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !selectedPracticeId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a practice",
        variant: "destructive",
      });
      return;
    }
    createManagerMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Practice Manager Account
          </DialogTitle>
          <DialogDescription>
            Create a new practice manager account with temporary credentials. 
            The manager will receive login details via email and be prompted to change their password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Manager Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="manager@practice.nhs.uk"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryContactRole">Role/Position</Label>
              <Input
                id="primaryContactRole"
                value={formData.primaryContactRole}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryContactRole: e.target.value }))}
                placeholder="e.g., Practice Manager, Lead GP"
              />
            </div>
          </div>

          {/* Practice Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Practice Assignment</h3>
            <div className="space-y-2">
              <Label htmlFor="practiceSelection">Select GP Practice *</Label>
              <Select 
                value={selectedPracticeId} 
                onValueChange={(value) => setSelectedPracticeId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an existing GP practice" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(practices) && practices.map((practice: any) => (
                    <SelectItem key={practice.id} value={practice.id}>
                      {practice.name} - {practice.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Select from existing GP practices. Details will be auto-populated.
              </p>
            </div>
            
            {/* Auto-populated Practice Details (Read-only) */}
            {selectedPracticeId && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">GP Practice Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p className="font-medium">{formData.practiceName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Practice Type</Label>
                    <p className="capitalize">{formData.facilityType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Address</Label>
                    <p>{formData.address}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Postcode</Label>
                    <p>{formData.postcode}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-600">Phone Number</Label>
                    <p>{formData.mainPhone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about the GP practice or manager..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createManagerMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createManagerMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createManagerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Create Account & Send Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}