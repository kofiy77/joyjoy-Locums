import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, User, AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink, Shield } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CertificationWithStaff {
  id: number;
  staffId: number;
  title: string;
  category: string;
  filePath: string;
  issuedDate: Date | null;
  expiryDate: Date | null;
  isValid: boolean;
  verificationStatus: string;
  verificationNotes: string | null;
  verifiedBy: number | null;
  verifiedAt: Date | null;
  createdAt: Date;
  staff: {
    firstName: string;
    lastName: string;
    userId: number;
  };
  user: {
    email: string;
    phone: string | null;
  };
}

export default function AdminCertificationVerifier() {
  const { toast } = useToast();
  const [selectedCert, setSelectedCert] = useState<CertificationWithStaff | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  const { data: pendingCerts, isLoading: loadingPending } = useQuery<CertificationWithStaff[]>({
    queryKey: ['/api/admin/certifications/pending'],
  });

  const { data: allCerts, isLoading: loadingAll } = useQuery<CertificationWithStaff[]>({
    queryKey: ['/api/admin/certifications/all'],
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ certId, status, notes }: { certId: number; status: 'verified' | 'rejected'; notes: string }) => {
      const response = await fetch(`/api/admin/certifications/${certId}/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Failed to verify certification');
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Verification Updated",
        description: `Certification ${variables.status === 'verified' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedCert(null);
      setVerificationNotes("");
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: Date | string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const CertificationCard = ({ cert }: { cert: CertificationWithStaff }) => {
    const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate);
    const isExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedCert?.id === cert.id ? 'ring-2 ring-blue-500' : ''
        } ${isExpired ? 'border-red-200' : isExpiring ? 'border-yellow-200' : ''}`}
        onClick={() => setSelectedCert(cert)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium text-sm">{cert.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              {getStatusIcon(cert.verificationStatus)}
              <Badge variant="outline" className={getStatusColor(cert.verificationStatus)}>
                {cert.verificationStatus}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>{cert.staff.firstName} {cert.staff.lastName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Expires: {formatDate(cert.expiryDate)}</span>
              {isExpired && <Badge variant="destructive" className="text-xs">Expired</Badge>}
              {isExpiring && <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">Expiring Soon</Badge>}
            </div>

            <div className="text-xs text-gray-500">
              Uploaded: {formatDate(cert.createdAt)}
            </div>

            {daysUntilExpiry !== null && (
              <div className={`text-xs font-medium ${
                isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {isExpired ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : 
                 `${daysUntilExpiry} days remaining`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Certification Verification</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{pendingCerts?.length || 0} pending review</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingCerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Certifications ({allCerts?.length || 0})
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Certification List */}
          <div className="lg:col-span-2">
            <TabsContent value="pending" className="space-y-3">
              {loadingPending ? (
                <div className="text-center py-8 text-gray-500">Loading pending certifications...</div>
              ) : !pendingCerts?.length ? (
                <div className="text-center py-8 text-gray-500">No pending certifications</div>
              ) : (
                pendingCerts.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3">
              {loadingAll ? (
                <div className="text-center py-8 text-gray-500">Loading all certifications...</div>
              ) : !allCerts?.length ? (
                <div className="text-center py-8 text-gray-500">No certifications found</div>
              ) : (
                allCerts.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))
              )}
            </TabsContent>
          </div>

          {/* Verification Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Verification Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCert ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">{selectedCert.title}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedCert.staff.firstName} {selectedCert.staff.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{selectedCert.user.email}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {selectedCert.category}
                      </div>
                      <div>
                        <span className="font-medium">Issued:</span> {formatDate(selectedCert.issuedDate)}
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span> {formatDate(selectedCert.expiryDate)}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge variant="outline" className={`ml-2 ${getStatusColor(selectedCert.verificationStatus)}`}>
                          {selectedCert.verificationStatus}
                        </Badge>
                      </div>
                    </div>

                    {selectedCert.filePath && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.open(`/uploads/${selectedCert.filePath}`, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                        
                        {/* DBS Check Verification Button */}
                        {(selectedCert.title.toLowerCase().includes('dbs') || 
                          selectedCert.category.toLowerCase().includes('dbs') ||
                          selectedCert.title.toLowerCase().includes('disclosure') ||
                          selectedCert.title.toLowerCase().includes('barring')) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200"
                            onClick={() => window.open('https://secure.crbonline.gov.uk/crsc/check?execution=e3s1', '_blank')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Verify DBS Online
                          </Button>
                        )}
                      </div>
                    )}

                    {selectedCert.verificationStatus === 'pending' && (
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium mb-1">Verification Notes</label>
                          <textarea
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            rows={3}
                            placeholder="Add notes about the verification..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => verifyMutation.mutate({
                              certId: selectedCert.id,
                              status: 'verified',
                              notes: verificationNotes
                            })}
                            disabled={verifyMutation.isPending}
                            className="flex-1"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => verifyMutation.mutate({
                              certId: selectedCert.id,
                              status: 'rejected',
                              notes: verificationNotes
                            })}
                            disabled={verifyMutation.isPending}
                            variant="destructive"
                            className="flex-1"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedCert.verificationNotes && (
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-1">Previous Notes:</h4>
                        <p className="text-sm text-gray-600">{selectedCert.verificationNotes}</p>
                        {selectedCert.verifiedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Verified on {formatDate(selectedCert.verifiedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a certification to review
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}