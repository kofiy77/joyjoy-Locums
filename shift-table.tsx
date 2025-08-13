import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Edit, RotateCcw } from "lucide-react";
import type { Shift } from "@shared/schema";

const skillLabels: Record<string, string> = {
  dementia_care: "Dementia Care",
  moving_handling: "Moving & Handling",
  medication_admin: "Medication Admin",
  safeguarding: "Safeguarding",
  catheter_care: "Catheter Care",
  wound_care: "Wound Care"
};

const roleLabels: Record<string, string> = {
  healthcare_assistant: "Healthcare Assistant",
  registered_nurse: "Registered Nurse",
  support_worker: "Support Worker"
};

export default function ShiftTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['/api/shifts'],
  });

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = roleLabels[shift.role as keyof typeof roleLabels]
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || shift.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      open: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      declined: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800"
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} status-badge`}>
        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'pending' ? 'animate-pulse bg-yellow-500' : 
          status === 'confirmed' ? 'bg-green-500' :
          status === 'open' ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSkillBadge = (skill: string) => {
    const baseClass = "skill-badge";
    const skillClass = {
      dementia_care: "skill-badge-dementia",
      moving_handling: "skill-badge-moving", 
      medication_admin: "skill-badge-medication",
      safeguarding: "skill-badge-safeguarding"
    }[skill] || "bg-gray-100 text-gray-800";

    return (
      <Badge key={skill} className={`${baseClass} ${skillClass}`}>
        {skillLabels[skill] || skill}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="healthcare-shadow">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="healthcare-shadow overflow-hidden">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Upcoming Shifts</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Shift Details</TableHead>
              <TableHead>Care Home</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned Staff</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No shifts found
                </TableCell>
              </TableRow>
            ) : (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {roleLabels[shift.role as keyof typeof roleLabels]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(shift.date).toLocaleDateString('en-GB')} • {shift.startTime} - {shift.endTime}
                      </p>
                      {shift.requiredSkills && shift.requiredSkills.length > 0 && (
                        <div className="flex items-center mt-1 space-x-2">
                          {shift.requiredSkills.slice(0, 2).map((skill) => getSkillBadge(skill))}
                          {shift.requiredSkills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{shift.requiredSkills.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">Care Home Name</p>
                      <p className="text-sm text-gray-500">Location, Postcode</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(shift.status)}
                  </TableCell>
                  <TableCell>
                    {shift.status === 'confirmed' ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Staff Member</p>
                          <p className="text-xs text-gray-500">Confirmed via SMS</p>
                        </div>
                      </div>
                    ) : shift.status === 'pending' ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">Staff Member</p>
                          <p className="text-xs text-gray-500">SMS sent 2h ago</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No staff assigned</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {shift.status === 'pending' ? (
                        <Button variant="ghost" size="sm" className="text-orange-600">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CardContent className="border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{Math.min(10, filteredShifts.length)}</span> of{" "}
            <span className="font-medium">{filteredShifts.length}</span> shifts
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button size="sm" className="bg-primary text-white">
              1
            </Button>
            <Button variant="ghost" size="sm">
              2
            </Button>
            <Button variant="ghost" size="sm">
              3
            </Button>
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
