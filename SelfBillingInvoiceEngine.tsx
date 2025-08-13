import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, subWeeks, addWeeks } from "date-fns";
import {
  Calculator, FileText, DollarSign, Clock, Users, TrendingUp, Download,
  Eye, Edit, Trash2, Send, CheckCircle, XCircle, AlertTriangle,
  Calendar, Building2, CreditCard, Settings, BarChart3, PieChart,
  Receipt, Banknote, Target, ArrowUpDown, RefreshCw, Filter,
  Plus, Search, MoreHorizontal, Printer, Mail, FileDown, Upload
} from "lucide-react";

interface InvoiceLineItem {
  id: string;
  staffName: string;
  staffPaystreamId?: string;
  role: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  billableHours: number;
  internalRate: number;
  externalRate: number;
  rateUsed: number;
  lineTotal: number;
  locationName: string;
  locationType: 'care_home' | 'gp_practice';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'client' | 'paystream';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  clientName?: string;
  clientId?: string;
  paystreamReference?: string;
  invoiceDate: string;
  periodStartDate: string;
  periodEndDate: string;
  dueDate: string;
  subtotalAmount: number;
  vatAmount: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  isSelfBilled: boolean;
  pdfUrl?: string;
  csvUrl?: string;
}

interface BillingPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed';
  totalShifts: number;
  totalHours: number;
  totalClientAmount: number;
  totalPaystreamAmount: number;
  clientInvoicesGenerated: boolean;
  paystreamInvoicesGenerated: boolean;
  notes?: string;
}

interface InvoiceSettings {
  id: string;
  billingFrequency: 'weekly' | 'fortnightly' | 'monthly';
  clientInvoicePrefix: string;
  paystreamInvoicePrefix: string;
  vatRate: number;
  isVatRegistered: boolean;
  vatNumber: string;
  companyRegistrationNumber: string;
  paymentTermsDays: number;
  roundToQuarterHour: boolean;
  autoEmailEnabled: boolean;
  invoiceFooterText: string;
}

export default function SelfBillingInvoiceEngine() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Data queries
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({ 
    queryKey: ['/api/invoicing/invoices'],
    retry: 1
  });
  
  const { data: billingPeriods = [], isLoading: periodsLoading } = useQuery({ 
    queryKey: ['/api/invoicing/billing-periods'],
    retry: 1
  });
  
  const { data: invoiceSettings = {}, isLoading: settingsLoading } = useQuery({ 
    queryKey: ['/api/invoicing/settings'],
    retry: 1
  });

  const { data: dashboardStats = {}, isLoading: statsLoading } = useQuery({ 
    queryKey: ['/api/invoicing/dashboard-stats'],
    retry: 1
  });

  // Type the data properly
  const invoicesData = invoices as Invoice[];
  const billingPeriodsData = billingPeriods as BillingPeriod[];
  const statsData = dashboardStats as any;

  // Filter invoices based on search and filters
  const filteredInvoices = useMemo(() => {
    return invoicesData.filter((invoice: Invoice) => {
      const matchesSearch = !searchTerm || 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.paystreamReference?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
      const matchesType = filterType === "all" || invoice.invoiceType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoicesData, searchTerm, filterStatus, filterType]);

  // Generate invoice mutation
  const generateInvoiceMutation = useMutation({
    mutationFn: async (data: { 
      periodId: string; 
      invoiceType: 'client' | 'paystream';
      clientId?: string;
    }) => {
      const response = await apiRequest('/api/invoicing/generate', {
        method: 'POST',
        body: data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoicing/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoicing/billing-periods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoicing/dashboard-stats'] });
      toast({
        title: "Success",
        description: "Invoice generated successfully",
      });
      setShowCreateInvoiceDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    }
  });

  // Send invoice mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest(`/api/invoicing/invoices/${invoiceId}/send`, {
        method: 'POST',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoicing/invoices'] });
      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive",
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<InvoiceSettings>) => {
      const response = await apiRequest('/api/invoicing/settings', {
        method: 'PUT',
        body: settings,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoicing/settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      setShowSettingsDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  // Download invoice handler
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Use direct fetch instead of apiRequest for file downloads
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/invoicing/invoices/${invoice.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${invoice.invoiceNumber}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Invoice downloaded successfully",
        });
      } else {
        const errorText = await response.text();
        console.error('Download failed:', errorText);
        throw new Error(`Download failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error", 
        description: `Failed to download invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      sent: "default", 
      paid: "default",
      overdue: "destructive",
      cancelled: "outline"
    } as const;
    
    const colors = {
      draft: "bg-gray-100 text-gray-700",
      sent: "bg-blue-100 text-blue-700",
      paid: "bg-green-100 text-green-700", 
      overdue: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-500"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (invoicesLoading || periodsLoading || settingsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading Self-Billing & Invoicing Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            Self-Billing & Invoicing Engine
          </h2>
          <p className="text-gray-600 mt-1">
            HMRC-compliant dual-path invoicing for PayStream payroll and client billing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSettingsDialog(true)}
            variant="outline"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button
            onClick={() => setShowCreateInvoiceDialog(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency((statsData as any)?.totalRevenue || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency((statsData as any)?.outstanding || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency((statsData as any)?.thisMonth || 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margin %</p>
                <p className="text-2xl font-bold text-purple-600">
                  {((statsData as any)?.marginPercentage || 0).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="periods">
            <Calendar className="h-4 w-4 mr-2" />
            Billing Periods
          </TabsTrigger>
          <TabsTrigger value="paystream">
            <Users className="h-4 w-4 mr-2" />
            PayStream Config
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Recent Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(invoicesData as any)?.slice(0, 5).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">
                          {invoice.clientName || invoice.paystreamReference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.totalAmount)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing Periods Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Billing Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(billingPeriodsData as any)?.slice(0, 5).map((period: any) => (
                    <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          {format(new Date(period.startDate), 'MMM dd')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">{period.totalShifts} shifts</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(parseFloat(period.totalClientAmount.toString()))}</p>
                        <Badge variant={period.status === 'open' ? 'default' : 'outline'}>
                          {period.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="paystream">PayStream</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client/Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.invoiceType === 'client' ? 'default' : 'secondary'}>
                          {invoice.invoiceType === 'client' ? 'Client' : 'PayStream'}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.clientName || invoice.paystreamReference}</TableCell>
                      <TableCell>{format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.periodStartDate), 'MMM dd')} - {format(new Date(invoice.periodEndDate), 'MMM dd')}
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoicePreview(true);
                            }}
                            title="View Invoice Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendInvoiceMutation.mutate(invoice.id)}
                              disabled={sendInvoiceMutation.isPending}
                              title="Send Invoice"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Periods Tab */}
        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Periods Management</CardTitle>
              <CardDescription>
                View and manage billing periods for automated invoice generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Shifts</TableHead>
                    <TableHead>Staff Hours</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Costs</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(billingPeriodsData as any)?.map((period: any) => (
                    <TableRow key={period.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(new Date(period.startDate), 'MMM dd')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{period.periodName}</Badge>
                      </TableCell>
                      <TableCell>{period.totalShifts}</TableCell>
                      <TableCell>{parseFloat(period.totalHours.toString()).toFixed(1)}h</TableCell>
                      <TableCell>{formatCurrency(parseFloat(period.totalClientAmount.toString()))}</TableCell>
                      <TableCell>{formatCurrency(parseFloat(period.totalPaystreamAmount.toString()))}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(parseFloat(period.totalClientAmount.toString()) - parseFloat(period.totalPaystreamAmount.toString()))}</p>
                          <p className="text-sm text-gray-600">
                            {parseFloat(period.totalClientAmount.toString()) > 0 ? 
                              (((parseFloat(period.totalClientAmount.toString()) - parseFloat(period.totalPaystreamAmount.toString())) / parseFloat(period.totalClientAmount.toString())) * 100).toFixed(1) : 
                              0}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={period.status === 'open' ? 'default' : 'outline'}>
                          {period.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedPeriod(period)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PayStream Config Tab */}
        <TabsContent value="paystream" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PayStream Staff Configuration</CardTitle>
              <CardDescription>
                Manage staff PayStream IDs and self-billing agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">PayStream staff configuration coming soon</p>
                <p className="text-sm text-gray-500 mt-2">
                  This section will allow configuration of staff PayStream IDs, bank details, 
                  and self-billing agreement management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Settings</DialogTitle>
            <DialogDescription>
              Configure billing frequency, VAT settings, and invoice preferences
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Billing Frequency</Label>
              <Select defaultValue={(invoiceSettings as any)?.billingFrequency || 'weekly'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="fortnightly">Fortnightly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>VAT Rate (%)</Label>
              <Input 
                type="number" 
                defaultValue={(invoiceSettings as any)?.vatRate || 20}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Invoice Prefix</Label>
              <Input defaultValue={(invoiceSettings as any)?.clientInvoicePrefix || 'JJC-'} />
            </div>
            <div className="space-y-2">
              <Label>PayStream Prefix</Label>
              <Input defaultValue={(invoiceSettings as any)?.paystreamInvoicePrefix || 'PYS-'} />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms (Days)</Label>
              <Input 
                type="number" 
                defaultValue={(invoiceSettings as any)?.paymentTermsDays || 30}
              />
            </div>
            <div className="space-y-2">
              <Label>VAT Number</Label>
              <Input defaultValue={(invoiceSettings as any)?.vatNumber || 'GB123456789'} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Invoice Footer Text</Label>
            <Textarea 
              defaultValue={(invoiceSettings as any)?.invoiceFooterText || 'Thank you for choosing JoyJoy Locums - Professional Medical Staffing Solutions'}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="vat-registered" 
              defaultChecked={(invoiceSettings as any)?.isVatRegistered} 
            />
            <Label htmlFor="vat-registered">VAT Registered</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="round-quarter" 
              defaultChecked={(invoiceSettings as any)?.roundToQuarterHour} 
            />
            <Label htmlFor="round-quarter">Round to quarter hour</Label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateSettingsMutation.mutate({})}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Company Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-blue-600">JoyJoy Locums</h2>
                    <p className="text-sm text-gray-600">Professional Medical Staffing Solutions</p>
                    <p className="text-sm text-gray-600">185 Mount Pleasant Lane, London, E5 9JG</p>
                    <p className="text-sm text-gray-600">Tel: 01293660094 | Email: info@joyjoylocums.co.uk</p>
                    <p className="text-sm text-gray-600">VAT Registration No: GB494539249</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold">INVOICE</h3>
                    <p className="text-sm">Invoice #: {selectedInvoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">Type: {selectedInvoice.invoiceType === 'client' ? 'Client Invoice' : 'PayStream Self-Billing'}</p>
                  </div>
                </div>
              </div>
              
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{selectedInvoice.clientName || selectedInvoice.paystreamReference}</p>
                    {selectedInvoice.invoiceType === 'client' && (
                      <>
                        <p>GP Practice</p>
                        <p>United Kingdom</p>
                      </>
                    )}
                    {selectedInvoice.invoiceType === 'paystream' && (
                      <>
                        <p>PayStream My Max Limited</p>
                        <p>Self-Billing Agreement</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Invoice Information:</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Invoice Date:</span> {format(new Date(selectedInvoice.invoiceDate), 'dd/MM/yyyy')}</p>
                    <p><span className="font-medium">Period:</span> {format(new Date(selectedInvoice.periodStartDate), 'dd/MM/yyyy')} - {format(new Date(selectedInvoice.periodEndDate), 'dd/MM/yyyy')}</p>
                    <p><span className="font-medium">Due Date:</span> {format(new Date(selectedInvoice.dueDate), 'dd/MM/yyyy')}</p>
                    <p><span className="font-medium">Status:</span> {getStatusBadge(selectedInvoice.status)}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-4">
                  {selectedInvoice.invoiceType === 'paystream' ? 'Individual Locum Breakdown:' : 'Services Provided:'}
                </h4>
                {selectedInvoice.invoiceType === 'paystream' ? (
                  /* PayStream itemized breakdown for individual locum processing */
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        PayStream Self-Billing Invoice - Individual Locum Details
                      </p>
                      <p className="text-xs text-blue-600">
                        Each line item represents individual locum work for third-party payroll processing including tax and NI deductions
                      </p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-100">
                          <TableHead className="font-semibold">Locum Name</TableHead>
                          <TableHead className="font-semibold">Role/Date</TableHead>
                          <TableHead className="font-semibold">Hours</TableHead>
                          <TableHead className="font-semibold">Pay Rate</TableHead>
                          <TableHead className="font-semibold text-right">Line Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Sample PayStream line items - will be populated from backend */}
                        <TableRow className="hover:bg-blue-50">
                          <TableCell>
                            <div>
                              <p className="font-medium">Dr. Sarah Wilson</p>
                              <p className="text-xs text-gray-600">PayStream ID: SW001</p>
                              <p className="text-xs text-gray-600">NI: AB123456C</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">General Practitioner</p>
                              <p className="text-sm text-gray-600">{format(new Date(selectedInvoice.periodStartDate), 'dd/MM/yyyy')}</p>
                              <p className="text-xs text-gray-500">Day Shift</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">8.00</p>
                              <p className="text-xs text-gray-600">09:00-17:00</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">£75.00/hr</p>
                              <p className="text-xs text-gray-600">Standard Rate</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £600.00
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-blue-50">
                          <TableCell>
                            <div>
                              <p className="font-medium">Dr. James Mitchell</p>
                              <p className="text-xs text-gray-600">PayStream ID: JM002</p>
                              <p className="text-xs text-gray-600">NI: CD987654E</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">Advanced Nurse Practitioner</p>
                              <p className="text-sm text-gray-600">{format(new Date(selectedInvoice.periodStartDate), 'dd/MM/yyyy')}</p>
                              <p className="text-xs text-gray-500">Evening Shift</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">6.50</p>
                              <p className="text-xs text-gray-600">17:00-23:30</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">£45.00/hr</p>
                              <p className="text-xs text-gray-600">Evening Premium</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            £292.50
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        <strong>Note for PayStream Processing:</strong> Each locum line shows individual work periods for separate payroll processing. 
                        PayStream will process tax deductions, National Insurance contributions, and direct payments to individual locum accounts based on these details.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Standard client invoice display */
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="font-medium">Medical Locum Services</p>
                            <p className="text-sm text-gray-600">GP Practice Cover</p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(selectedInvoice.periodStartDate), 'dd/MM')} - {format(new Date(selectedInvoice.periodEndDate), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>Various</TableCell>
                        <TableCell>Variable</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(parseFloat(selectedInvoice.subtotalAmount.toString()))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(parseFloat(selectedInvoice.subtotalAmount.toString()))}</span>
                    </div>
                    {selectedInvoice.vatAmount && parseFloat(selectedInvoice.vatAmount.toString()) > 0 && (
                      <div className="flex justify-between">
                        <span>VAT (20%):</span>
                        <span>{formatCurrency(parseFloat(selectedInvoice.vatAmount.toString()))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(parseFloat(selectedInvoice.totalAmount.toString()))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-sm text-gray-600">
                <p>Thank you for choosing JoyJoy Locums - Professional Medical Staffing Solutions</p>
                <p className="mt-2">Payment terms: Net {(invoiceSettings as any)?.paymentTermsDays || 30} days</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowInvoicePreview(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}