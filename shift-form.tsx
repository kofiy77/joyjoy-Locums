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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Maximize2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertShiftSchema } from "@shared/schema";

const shiftFormSchema = insertShiftSchema.extend({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
}).omit({ hourlyRate: true });

type ShiftFormData = z.infer<typeof shiftFormSchema>;

const availableSkills = [
  "dementia_care",
  "moving_handling", 
  "medication_admin",
  "safeguarding",
  "catheter_care",
  "wound_care"
];

const skillLabels: Record<string, string> = {
  dementia_care: "Dementia Care",
  moving_handling: "Moving & Handling",
  medication_admin: "Medication Admin",
  safeguarding: "Safeguarding",
  catheter_care: "Catheter Care",
  wound_care: "Wound Care"
};

export default function ShiftForm() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      role: "",
      date: "",
      startTime: "",
      endTime: "",
      additionalNotes: "",
    },
  });

  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      const shiftData = {
        ...data,
        date: new Date(data.date),
        requiredSkills: selectedSkills,
      };
      return apiRequest("POST", "/api/shifts", shiftData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      form.reset();
      setSelectedSkills([]);
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShiftFormData) => {
    createShiftMutation.mutate(data);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <Card className="lg:col-span-2 healthcare-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Create New Shift</CardTitle>
          <Button variant="ghost" size="sm">
            <Maximize2 className="h-4 w-4 mr-1" />
            Full Form
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role Required</Label>
              <Select onValueChange={(value) => form.setValue("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare_assistant">Healthcare Assistant</SelectItem>
                  <SelectItem value="registered_nurse">Registered Nurse</SelectItem>
                  <SelectItem value="support_worker">Support Worker</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.role.message}</p>
              )}
            </div>



            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div>
              <Label>Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  {...form.register("startTime")}
                />
                <Input
                  type="time"
                  {...form.register("endTime")}
                />
              </div>
              {(form.formState.errors.startTime || form.formState.errors.endTime) && (
                <p className="text-sm text-red-500 mt-1">Both start and end times are required</p>
              )}
            </div>
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {skillLabels[skill]}
                  {selectedSkills.includes(skill) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              rows={3}
              placeholder="Any specific requirements or information..."
              {...form.register("additionalNotes")}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <Button 
              type="submit" 
              disabled={createShiftMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createShiftMutation.isPending ? "Creating..." : "Create & Post Shift"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
