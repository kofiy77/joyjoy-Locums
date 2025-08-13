import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface ShiftKPIData {
  summary: {
    summary_period: string;
    total_shifts: number;
    fulfilled_shifts: number;
    unfulfilled_shifts: number;
    overall_fulfillment_rate: number;
    average_daily_unfulfilled: number;
  };
  daily_breakdown: Array<{
    date: string;
    care_home_name: string;
    total_shifts: number;
    fulfilled: number;
    unfulfilled: number;
    fulfillment_rate: number;
  }>;
  unfulfilled_shifts: Array<{
    id: string;
    date: string;
    role: string;
    start_time: string;
    end_time: string;
    hourly_rate: number;
    care_home_name: string;
    created_at: string;
    days_overdue: number;
  }>;
}

export default function ShiftKPIDashboard() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedCareHome, setSelectedCareHome] = useState<string>('all');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(dateRange));
  
  const { data: kpiData, isLoading, refetch } = useQuery<ShiftKPIData>({
    queryKey: ['/api/admin/kpi/shift-fulfillment', dateRange, selectedCareHome],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        ...(selectedCareHome !== 'all' && { care_home_id: selectedCareHome })
      });
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/kpi/shift-fulfillment?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch KPI data');
      return response.json();
    }
  });

  const { data: careHomes } = useQuery({
    queryKey: ['/api/admin/care-homes'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/care-homes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch care homes');
      return response.json();
    }
  });

  const processUnfulfilledShifts = async () => {
    try {
      const response = await fetch('/api/admin/process-unfulfilled-shifts', {
        method: 'POST',
      });
      
      if (response.ok) {
        refetch(); // Refresh the data
      }
    } catch (error) {
      console.error('Error processing unfulfilled shifts:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Shift Fulfillment KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading KPI data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = kpiData?.summary;
  const dailyBreakdown = kpiData?.daily_breakdown || [];
  const unfulfilledShifts = kpiData?.unfulfilled_shifts || [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCareHome} onValueChange={setSelectedCareHome}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select care home" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Care Homes</SelectItem>
              {careHomes?.map((home: any) => (
                <SelectItem key={home.id} value={home.id}>
                  {home.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={processUnfulfilledShifts} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Process Unfulfilled
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Shifts</p>
                <p className="text-2xl font-bold">{summary?.total_shifts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fulfilled</p>
                <p className="text-2xl font-bold text-green-600">{summary?.fulfilled_shifts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Unfulfilled</p>
                <p className="text-2xl font-bold text-red-600">{summary?.unfulfilled_shifts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                <p className="text-2xl font-bold">
                  {summary?.overall_fulfillment_rate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <Tabs defaultValue="unfulfilled" className="w-full">
        <TabsList>
          <TabsTrigger value="unfulfilled">
            Unfulfilled Shifts ({unfulfilledShifts.length})
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            Daily Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unfulfilled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Unfulfilled Shifts
              </CardTitle>
              <CardDescription>
                Shifts that were not allocated and have passed their scheduled date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unfulfilledShifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No unfulfilled shifts found</p>
                  <p className="text-sm">All shifts in the selected period were successfully allocated</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unfulfilledShifts.map((shift) => (
                    <div key={shift.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{shift.role}</h4>
                          <p className="text-sm text-muted-foreground">
                            {shift.care_home_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive">
                            {shift.days_overdue} days overdue
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {format(new Date(shift.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {shift.start_time} - {shift.end_time}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rate</p>
                          <p className="font-medium">£{shift.hourly_rate}/hour</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {format(new Date(shift.created_at), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Fulfillment Breakdown</CardTitle>
              <CardDescription>
                Daily shift fulfillment rates by care home
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyBreakdown.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No shift data found for the selected period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dailyBreakdown.map((day, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {format(new Date(day.date), 'EEEE, MMM dd, yyyy')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {day.care_home_name}
                          </p>
                        </div>
                        <Badge 
                          variant={day.fulfillment_rate >= 80 ? "default" : "destructive"}
                        >
                          {day.fulfillment_rate}% fulfilled
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Shifts</p>
                          <p className="font-medium">{day.total_shifts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fulfilled</p>
                          <p className="font-medium text-green-600">{day.fulfilled}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Unfulfilled</p>
                          <p className="font-medium text-red-600">{day.unfulfilled}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}