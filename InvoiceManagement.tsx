import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Download, Eye, FileText, Plus, Filter, Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
  expected_hours?: number;
  actual_hours?: number;
  expected_amount?: number;
  hours_variance?: number;
  amount_variance?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  // Flattened care home fields from API
  careHomeName: string;
  careHomeAddress: string;
  careHomePhone: string;
  careHomeContact: string;
  careHomePostcode?: string;
  line_items?: Array<{
    id: string;
    description: string;
    staff_name: string;
    role: string;
    date: string;
    hours_worked: number;
    hourly_rate: number;
    line_total: number;
  }>;
}

interface InvoiceFilters {
  fromDate: string;
  toDate: string;
  careHomeId: string;
  status: string;
  searchTerm: string;
}

interface InvoiceFormData {
  care_home_id: string;
  period_start: string;
  period_end: string;
  notes: string;
}

const InvoiceManagement: React.FC = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<InvoiceFilters>({
    fromDate: '',
    toDate: '',
    careHomeId: 'all',
    status: 'all',
    searchTerm: ''
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [createForm, setCreateForm] = useState({
    careHomeId: '',
    periodFrom: '',
    periodTo: '',
    notes: ''
  });

  // Build query parameters for filtering
  const queryParams = new URLSearchParams();
  if (filters.fromDate) queryParams.append('from_date', filters.fromDate);
  if (filters.toDate) queryParams.append('to_date', filters.toDate);
  if (filters.careHomeId && filters.careHomeId !== 'all') queryParams.append('care_home_id', filters.careHomeId);
  if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);

  // Fetch invoices with filters
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['/api/invoices', queryParams.toString()],
    queryFn: async () => {
      const url = `/api/invoices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('🔍 Fetching invoices from:', url);
      const response = await apiRequest(url);
      const result = await response.json();
      console.log('📄 Invoices response:', result);
      return result;
    }
  });

  // Fetch care homes for dropdowns
  const { data: careHomes = [] } = useQuery({ 
    queryKey: ['/api/admin/care-homes']
  });

  // Filter invoices by search term
  const filteredInvoices = Array.isArray(invoices) ? invoices.filter((invoice: Invoice) => {
    if (!filters.searchTerm) return true;
    const searchLower = filters.searchTerm.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.careHomeName?.toLowerCase().includes(searchLower) ||
      invoice.careHomeContact?.toLowerCase().includes(searchLower)
    );
  }) : [];

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/invoices', 'POST', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: 'Invoice created successfully' });
      setShowCreateDialog(false);
      setCreateForm({ careHomeId: '', periodFrom: '', periodTo: '', notes: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating invoice', 
        description: error.message || 'Failed to create invoice',
        variant: 'destructive' 
      });
    }
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest(`/api/invoices/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({ title: 'Invoice updated successfully' });
      if (selectedInvoice) {
        // Refresh the selected invoice details
        fetchInvoiceDetail(selectedInvoice.id);
      }
    }
  });

  // Fetch detailed invoice with line items
  const fetchInvoiceDetail = async (invoiceId: string) => {
    try {
      const response = await apiRequest(`/api/invoices/${invoiceId}`);
      const invoice = await response.json();
      setSelectedInvoice(invoice);
      setShowInvoiceDetail(true);
    } catch (error) {
      toast({ title: 'Error fetching invoice details', variant: 'destructive' });
    }
  };

  // Generate PDF invoice
  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    
    // Company header
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text('JoyJoy Care', 20, 30);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Temporary Care Staffing Solutions', 20, 40);
    doc.text('185 Mount Pleasant Lane, London, E5 9JG', 20, 50);
    doc.text('Tel: 01293660094 | Email: info@joyjoycare.co.uk', 20, 60);
    doc.text('VAT Registration No: GB494539249', 20, 70);

    // Invoice details
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('INVOICE', 150, 30);
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoice.invoice_number}`, 150, 45);
    doc.text(`Invoice Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 150, 55);
    doc.text(`Due Date: ${format(new Date(invoice.due_date), 'dd/MM/yyyy')}`, 150, 65);
    doc.text(`Period: ${format(new Date(invoice.period_start), 'dd/MM/yyyy')} - ${format(new Date(invoice.period_end), 'dd/MM/yyyy')}`, 150, 75);

    // Bill to section
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 90);
    doc.setFontSize(10);
    doc.text(invoice.careHomeName, 20, 105);
    doc.text(invoice.careHomeAddress, 20, 115);
    doc.text(invoice.careHomePostcode || '', 20, 125);
    doc.text(`Contact: ${invoice.careHomeContact}`, 20, 135);

    // Line items table
    const tableData = invoice.line_items?.map(item => [
      format(new Date(item.date), 'dd/MM/yyyy'),
      item.description,
      item.staff_name,
      item.hours_worked.toFixed(1),
      `£${item.hourly_rate.toFixed(2)}`,
      `£${item.line_total.toFixed(2)}`
    ]) || [];

    autoTable(doc, {
      head: [['Date', 'Description', 'Staff Member', 'Hours', 'Rate', 'Total']],
      body: tableData,
      startY: 150,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 116, 166] }
    });

    // Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text(`Subtotal: £${parseFloat(invoice.subtotal.toString()).toFixed(2)}`, 150, finalY);
    doc.text(`VAT (20%): £${parseFloat(invoice.vat_amount?.toString() || '0').toFixed(2)}`, 150, finalY + 10);
    doc.setFontSize(12);
    doc.text(`Total: £${parseFloat(invoice.total_amount.toString()).toFixed(2)}`, 150, finalY + 25);

    // Payment terms
    doc.setFontSize(8);
    doc.text('Payment Terms: Net 30 days from invoice date', 20, finalY + 40);
    doc.text('Bank Details: Sort Code: 12-34-56, Account: 12345678, Account Name: JoyJoy Care Ltd', 20, finalY + 50);

    // Save the PDF
    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
  };

  // Generate Excel export
  const generateExcel = (invoices: Invoice[]) => {
    const worksheetData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number,
      'Care Home': invoice.careHomeName,
      'Invoice Date': format(new Date(invoice.invoice_date), 'dd/MM/yyyy'),
      'Due Date': format(new Date(invoice.due_date), 'dd/MM/yyyy'),
      'Period From': format(new Date(invoice.period_start), 'dd/MM/yyyy'),
      'Period To': format(new Date(invoice.period_end), 'dd/MM/yyyy'),
      'Subtotal': parseFloat(invoice.subtotal.toString()).toFixed(2),
      'VAT Amount': parseFloat(invoice.vat_amount?.toString() || '0').toFixed(2),
      'Total Amount': parseFloat(invoice.total_amount.toString()).toFixed(2),
      'Status': invoice.status.toUpperCase(),
      'Contact': invoice.careHomeContact
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `JoyJoy_Invoices_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.draft}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleCreateInvoice = () => {
    if (!createForm.careHomeId || !createForm.periodFrom || !createForm.periodTo) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    createInvoiceMutation.mutate({
      care_home_id: createForm.careHomeId,
      period_start: createForm.periodFrom,
      period_end: createForm.periodTo,
      notes: createForm.notes
    });
  };

  const handleStatusUpdate = (invoiceId: string, newStatus: string) => {
    updateInvoiceMutation.mutate({ id: invoiceId, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-gray-600">Create and manage invoices for care facilities</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => generateExcel(filteredInvoices)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="careHome">Care Home *</Label>
                  <Select value={createForm.careHomeId} onValueChange={(value) => setCreateForm({...createForm, careHomeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select care home" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(careHomes) && careHomes.map((home: any) => (
                        <SelectItem key={home.id} value={home.id}>
                          {home.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodFrom">Period From *</Label>
                    <Input
                      id="periodFrom"
                      type="date"
                      value={createForm.periodFrom}
                      onChange={(e) => setCreateForm({...createForm, periodFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodTo">Period To *</Label>
                    <Input
                      id="periodTo"
                      type="date"
                      value={createForm.periodTo}
                      onChange={(e) => setCreateForm({...createForm, periodTo: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or comments"
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInvoice} disabled={createInvoiceMutation.isPending}>
                    {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({...filters, toDate: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="careHomeFilter">Care Home</Label>
              <Select value={filters.careHomeId} onValueChange={(value) => setFilters({...filters, careHomeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All care homes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All care homes</SelectItem>
                  {Array.isArray(careHomes) && careHomes.map((home: any) => (
                    <SelectItem key={home.id} value={home.id}>
                      {home.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="statusFilter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Invoice number, care home..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ fromDate: '', toDate: '', careHomeId: '', status: '', searchTerm: '' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoices ({filteredInvoices.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading invoices: {error.message}</p>
              <pre className="text-xs mt-2 text-left">{JSON.stringify(error, null, 2)}</pre>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No invoices found. Raw data: {JSON.stringify(invoices)}</p>
              <p>Backend shows 8 invoices available. Check authentication.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Care Home</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Hours Variance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.careHomeName}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.period_start), 'dd/MM/yy')} - {format(new Date(invoice.period_end), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>£{parseFloat(invoice.total_amount.toString()).toFixed(2)}</TableCell>
                      <TableCell>
                        {invoice.hours_variance !== undefined && invoice.hours_variance !== null ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            Math.abs(invoice.hours_variance) > 5 
                              ? invoice.hours_variance > 0 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-red-100 text-red-800'
                              : Math.abs(invoice.hours_variance) > 0
                                ? invoice.hours_variance > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {invoice.hours_variance > 0 ? '+' : ''}{invoice.hours_variance.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchInvoiceDetail(invoice.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generatePDF(invoice)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Select value={invoice.status} onValueChange={(value) => handleStatusUpdate(invoice.id, value)}>
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="sent">Sent</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={showInvoiceDetail} onOpenChange={setShowInvoiceDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Company Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">JoyJoy Care</h2>
                    <p className="text-sm text-gray-600">Temporary Care Staffing Solutions</p>
                    <p className="text-sm text-gray-600">185 Mount Pleasant Lane, London, E5 9JG</p>
                    <p className="text-sm text-gray-600">Tel: 01293660094 | Email: info@joyjoycare.co.uk</p>
                    <p className="text-sm text-gray-600">VAT Registration No: GB494539249</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold">INVOICE</h3>
                    <p className="text-sm">Invoice #: {selectedInvoice.invoice_number}</p>
                  </div>
                </div>
              </div>
              
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Care Home Details</h3>
                  <p className="font-medium">{selectedInvoice.careHomeName}</p>
                  <p>{selectedInvoice.careHomeAddress}</p>
                  <p>{selectedInvoice.careHomePostcode || ''}</p>
                  <p>Contact: {selectedInvoice.careHomeContact}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Invoice Information</h3>
                  <p>Invoice Date: {format(new Date(selectedInvoice.invoice_date), 'dd/MM/yyyy')}</p>
                  <p>Due Date: {format(new Date(selectedInvoice.due_date), 'dd/MM/yyyy')}</p>
                  <p>Period: {format(new Date(selectedInvoice.period_start), 'dd/MM/yyyy')} - {format(new Date(selectedInvoice.period_end), 'dd/MM/yyyy')}</p>
                  <p>Status: {getStatusBadge(selectedInvoice.status)}</p>
                </div>

                {(selectedInvoice.expected_hours || selectedInvoice.actual_hours) && (
                  <div>
                    <h3 className="font-semibold mb-2">Hours Analysis</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Expected Hours:</p>
                        <p className="font-medium">{selectedInvoice.expected_hours?.toFixed(1) || '0.0'}h</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Actual Hours:</p>
                        <p className="font-medium">{selectedInvoice.actual_hours?.toFixed(1) || '0.0'}h</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Hours Variance:</p>
                        <p className={`font-medium ${(selectedInvoice.hours_variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(selectedInvoice.hours_variance || 0) >= 0 ? '+' : ''}{selectedInvoice.hours_variance?.toFixed(1) || '0.0'}h
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Amount Variance:</p>
                        <p className={`font-medium ${(selectedInvoice.amount_variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(selectedInvoice.amount_variance || 0) >= 0 ? '+' : ''}£{Math.abs(selectedInvoice.amount_variance || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-semibold mb-2">Line Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.line_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.staff_name}</TableCell>
                        <TableCell>{item.hours_worked.toFixed(1)}</TableCell>
                        <TableCell>£{item.hourly_rate.toFixed(2)}</TableCell>
                        <TableCell>£{item.line_total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>£{parseFloat(selectedInvoice.subtotal.toString()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (20%):</span>
                      <span>£{parseFloat(selectedInvoice.vat_amount.toString()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>£{parseFloat(selectedInvoice.total_amount.toString()).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInvoiceDetail(false)}>
                  Close
                </Button>
                <Button onClick={() => generatePDF(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceManagement;