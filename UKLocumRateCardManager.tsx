import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calculator, Edit, Plus, Trash2, DollarSign, TrendingUp, 
  Stethoscope, UserCog, Building2, AlertCircle, CheckCircle, Save
} from "lucide-react";

interface UKLocumRateCard {
  id: string;
  role: string;
  workerPayRateMin: string;
  workerPayRateMax: string;
  clientBillRateMin: string;
  clientBillRateMax: string;
  agencyMarkupMin: string | null;
  agencyMarkupMax: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UKLocumRateCardManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRateCard, setSelectedRateCard] = useState<UKLocumRateCard | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    role: "",
    worker_pay_rate_min: "",
    worker_pay_rate_max: "",
    client_bill_rate_min: "",
    client_bill_rate_max: "",
    agency_markup_min: "",
    agency_markup_max: "",
    notes: "",
    is_active: true
  });

  // Fetch rate cards
  const { data: rateCards = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/base-rate-cards'],
    retry: 1
  });

  // Create rate card mutation
  const createRateCardMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('/api/admin/base-rate-cards', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/base-rate-cards'] });
      toast({ title: "Rate card created successfully" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create rate card", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Update rate card mutation
  const updateRateCardMutation = useMutation({
    mutationFn: async (data: any) => 
      apiRequest(`/api/admin/base-rate-cards/${data.id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/base-rate-cards'] });
      toast({ title: "Rate card updated successfully" });
      setShowEditDialog(false);
      setSelectedRateCard(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update rate card", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Delete rate card mutation
  const deleteRateCardMutation = useMutation({
    mutationFn: async (id: string) => 
      apiRequest(`/api/admin/base-rate-cards/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/base-rate-cards'] });
      toast({ title: "Rate card deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete rate card", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      role: "",
      worker_pay_rate_min: "",
      worker_pay_rate_max: "",
      client_bill_rate_min: "",
      client_bill_rate_max: "",
      agency_markup_min: "",
      agency_markup_max: "",
      notes: "",
      is_active: true
    });
  };

  const handleEdit = (rateCard: UKLocumRateCard) => {
    setSelectedRateCard(rateCard);
    setFormData({
      role: rateCard.role,
      worker_pay_rate_min: rateCard.workerPayRateMin,
      worker_pay_rate_max: rateCard.workerPayRateMax,
      client_bill_rate_min: rateCard.clientBillRateMin,
      client_bill_rate_max: rateCard.clientBillRateMax,
      agency_markup_min: rateCard.agencyMarkupMin || "",
      agency_markup_max: rateCard.agencyMarkupMax || "",
      notes: rateCard.notes || "",
      is_active: rateCard.isActive
    });
    setShowEditDialog(true);
  };

  const handleSubmit = () => {
    if (selectedRateCard) {
      updateRateCardMutation.mutate({
        ...formData,
        id: selectedRateCard.id,
        worker_pay_rate_min: parseFloat(formData.worker_pay_rate_min),
        worker_pay_rate_max: parseFloat(formData.worker_pay_rate_max),
        client_bill_rate_min: parseFloat(formData.client_bill_rate_min),
        client_bill_rate_max: parseFloat(formData.client_bill_rate_max),
        agency_markup_min: formData.agency_markup_min ? parseFloat(formData.agency_markup_min) : null,
        agency_markup_max: formData.agency_markup_max ? parseFloat(formData.agency_markup_max) : null,
      });
    } else {
      createRateCardMutation.mutate({
        ...formData,
        worker_pay_rate_min: parseFloat(formData.worker_pay_rate_min),
        worker_pay_rate_max: parseFloat(formData.worker_pay_rate_max),
        client_bill_rate_min: parseFloat(formData.client_bill_rate_min),
        client_bill_rate_max: parseFloat(formData.client_bill_rate_max),
        agency_markup_min: formData.agency_markup_min ? parseFloat(formData.agency_markup_min) : null,
        agency_markup_max: formData.agency_markup_max ? parseFloat(formData.agency_markup_max) : null,
      });
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('GP') || role.includes('General Practitioner')) {
      return <Stethoscope className="h-5 w-5 text-blue-600" />;
    }
    if (role.includes('Nurse')) {
      return <UserCog className="h-5 w-5 text-green-600" />;
    }
    return <Building2 className="h-5 w-5 text-gray-600" />;
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('GP') || role.includes('General Practitioner')) {
      return "bg-blue-100 text-blue-800";
    }
    if (role.includes('Nurse')) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            UK Medical Locum Rate Cards
          </h2>
          <p className="text-gray-600 mt-1">
            Manage authentic UK locum rates for medical professionals
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowCreateDialog(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rate Card
        </Button>
      </div>

      {/* Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(rateCards as UKLocumRateCard[]).map((rateCard: UKLocumRateCard) => (
          <Card key={rateCard.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRoleIcon(rateCard.role)}
                  <CardTitle className="text-lg">{rateCard.role}</CardTitle>
                </div>
                <Badge className={getRoleBadgeColor(rateCard.role)}>
                  {rateCard.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Worker Pay Rates */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 text-sm mb-2 flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Worker Pay Rate
                </h4>
                <p className="text-xl font-bold text-blue-800">
                  £{rateCard.workerPayRateMin} - £{rateCard.workerPayRateMax}/hr
                </p>
              </div>

              {/* Client Bill Rates */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-900 text-sm mb-2 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Client Bill Rate
                </h4>
                <p className="text-xl font-bold text-green-800">
                  £{rateCard.clientBillRateMin} - £{rateCard.clientBillRateMax}/hr
                </p>
              </div>

              {/* Agency Markup */}
              {rateCard.agencyMarkupMin && rateCard.agencyMarkupMax && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <h4 className="font-medium text-amber-900 text-sm mb-2">
                    Agency Markup
                  </h4>
                  <p className="text-lg font-semibold text-amber-800">
                    {rateCard.agencyMarkupMin}% - {rateCard.agencyMarkupMax}%
                  </p>
                </div>
              )}

              {/* Notes */}
              {rateCard.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  {rateCard.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(rateCard)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteRateCardMutation.mutate(rateCard.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setSelectedRateCard(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {selectedRateCard ? 'Edit Rate Card' : 'Create New Rate Card'}
            </DialogTitle>
            <DialogDescription>
              Configure UK medical locum rates and agency markup percentages
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <div className="md:col-span-2">
              <Label htmlFor="role">Medical Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., GP Locum (via agency)"
                required
              />
            </div>

            {/* Worker Pay Rates */}
            <div>
              <Label htmlFor="worker_pay_min">Worker Pay Min (£/hr) *</Label>
              <Input
                id="worker_pay_min"
                type="number"
                step="0.01"
                value={formData.worker_pay_rate_min}
                onChange={(e) => setFormData({ ...formData, worker_pay_rate_min: e.target.value })}
                placeholder="80.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="worker_pay_max">Worker Pay Max (£/hr) *</Label>
              <Input
                id="worker_pay_max"
                type="number"
                step="0.01"
                value={formData.worker_pay_rate_max}
                onChange={(e) => setFormData({ ...formData, worker_pay_rate_max: e.target.value })}
                placeholder="120.00"
                required
              />
            </div>

            {/* Client Bill Rates */}
            <div>
              <Label htmlFor="client_bill_min">Client Bill Min (£/hr) *</Label>
              <Input
                id="client_bill_min"
                type="number"
                step="0.01"
                value={formData.client_bill_rate_min}
                onChange={(e) => setFormData({ ...formData, client_bill_rate_min: e.target.value })}
                placeholder="100.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="client_bill_max">Client Bill Max (£/hr) *</Label>
              <Input
                id="client_bill_max"
                type="number"
                step="0.01"
                value={formData.client_bill_rate_max}
                onChange={(e) => setFormData({ ...formData, client_bill_rate_max: e.target.value })}
                placeholder="180.00"
                required
              />
            </div>

            {/* Agency Markup */}
            <div>
              <Label htmlFor="markup_min">Agency Markup Min (%)</Label>
              <Input
                id="markup_min"
                type="number"
                step="0.01"
                value={formData.agency_markup_min}
                onChange={(e) => setFormData({ ...formData, agency_markup_min: e.target.value })}
                placeholder="20.00"
              />
            </div>
            <div>
              <Label htmlFor="markup_max">Agency Markup Max (%)</Label>
              <Input
                id="markup_max"
                type="number"
                step="0.01"
                value={formData.agency_markup_max}
                onChange={(e) => setFormData({ ...formData, agency_markup_max: e.target.value })}
                placeholder="75.00"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Market conditions, regional variations, framework constraints..."
                rows={3}
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
                />
                <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Active Rate Card
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only active rate cards will be used for shift calculations and displayed to users
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setSelectedRateCard(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createRateCardMutation.isPending || updateRateCardMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {selectedRateCard ? 'Update Rate Card' : 'Create Rate Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {(rateCards as UKLocumRateCard[]).length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rate Cards Found</h3>
            <p className="text-gray-600 mb-4">
              Create your first UK medical locum rate card to get started
            </p>
            <Button 
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Rate Card
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}