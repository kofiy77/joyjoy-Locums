import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Building, Filter, Search, BarChart3 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers not showing in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// UK regions and their approximate center coordinates
const UK_REGIONS = [
  { name: 'Scotland', center: [56.4907, -4.2026], zoom: 6 },
  { name: 'Wales', center: [52.1307, -3.7837], zoom: 7 },
  { name: 'Northern Ireland', center: [54.7877, -6.4923], zoom: 7 },
  { name: 'England', center: [52.3555, -1.1743], zoom: 6 },
];

// Comprehensive UK sub-regions for filtering
const UK_SUB_REGIONS = [
  'London',
  'South East',
  'South West',
  'East of England',
  'East Midlands',
  'West Midlands',
  'Yorkshire and the Humber',
  'North West',
  'North East',
  'Scotland',
  'Wales',
  'Northern Ireland'
];

// Region coordinates for auto-zoom functionality
const REGION_COORDINATES = {
  'London': { center: [51.5074, -0.1278], zoom: 10 },
  'South East': { center: [51.2382, 0.5784], zoom: 8 },
  'South West': { center: [50.7156, -3.5309], zoom: 8 },
  'East of England': { center: [52.2405, 0.4011], zoom: 8 },
  'East Midlands': { center: [52.8382, -1.2533], zoom: 8 },
  'West Midlands': { center: [52.5170, -1.8158], zoom: 8 },
  'Yorkshire and the Humber': { center: [53.9591, -1.0815], zoom: 8 },
  'North West': { center: [53.4084, -2.9916], zoom: 8 },
  'North East': { center: [54.9783, -1.6178], zoom: 8 },
  'Scotland': { center: [56.4907, -4.2026], zoom: 6 },
  'Wales': { center: [52.1307, -3.7837], zoom: 7 },
  'Northern Ireland': { center: [54.7877, -6.4923], zoom: 7 }
};

// MapController component to handle map flyTo functionality
interface MapControllerProps {
  targetRegion: string;
}

function MapController({ targetRegion }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    if (targetRegion !== 'all' && REGION_COORDINATES[targetRegion as keyof typeof REGION_COORDINATES]) {
      const regionCoords = REGION_COORDINATES[targetRegion as keyof typeof REGION_COORDINATES];
      map.flyTo(regionCoords.center, regionCoords.zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (targetRegion === 'all') {
      // Reset to UK overview
      map.flyTo([54.5, -3], 6, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [targetRegion, map]);
  
  return null;
}

// Custom icons for different engagement levels
const createCustomIcon = (color: string, iconType: 'home' | 'staff' = 'home') => {
  const iconHtml = iconType === 'home' 
    ? `<div style="background: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; z-index: 1000;">🏠</div>`
    : `<div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; opacity: 1; z-index: 1001; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-icon',
    iconSize: iconType === 'home' ? [25, 25] : [20, 20],
    iconAnchor: iconType === 'home' ? [12, 12] : [10, 10],
    popupAnchor: [0, -10],
  });
};

// Get color based on engagement level
const getEngagementColor = (level: string) => {
  switch (level) {
    case 'full_engagement': return '#3b82f6'; // Blue
    case 'some_engagement': return '#f59e0b'; // Amber
    case 'no_engagement': return '#ef4444'; // Red
    default: return '#6b7280'; // Gray
  }
};

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface CareHome {
  id: string;
  name: string;
  address: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  county?: string;
  engagementLevel: string;
  lastContactedDate?: string;
  totalShifts: number;
  filledShifts: number;
  unfilledShifts: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  county?: string;
  isAvailable: boolean;
  maxDistance: number;
  status: string;
  statusColor: string;
  statusDescription: string;
  experience: number;
  lastActive: string;
  shiftCount: number;
  rating: number;
}

interface MapFilters {
  region: string;
  engagementLevel: string;
  staffRole: string;
  careHome: string;
  searchTerm: string;
  radiusKm: number;
}

export default function UKMapView() {
  const [filters, setFilters] = useState<MapFilters>({
    region: 'all',
    engagementLevel: 'all',
    staffRole: 'all',
    careHome: 'all',
    searchTerm: '',
    radiusKm: 25,
  });
  
  const [selectedCareHome, setSelectedCareHome] = useState<CareHome | null>(null);
  const [showStaffRadius, setShowStaffRadius] = useState(false);

  // Fetch map data (care homes + staff with coordinates)
  const { data: mapData, isLoading: isLoadingMapData } = useQuery({
    queryKey: ['/api/admin/map-data'],
  });

  // Extract care homes and staff from map data
  const careHomes = mapData?.careHomes || [];
  const staff = mapData?.staff || [];

  // Transform care homes data for map display
  const mapCareHomes = useMemo(() => {
    if (!careHomes) return [];
    
    return careHomes.map((home: any) => ({
      id: home.id,
      name: home.name,
      address: home.address,
      postcode: home.postcode,
      latitude: home.latitude,
      longitude: home.longitude,
      region: home.region,
      county: home.county,
      engagementLevel: home.engagementLevel,
      facilityType: home.facilityType,
      contractStatus: home.contractStatus,
    })).filter((home: any) => home.latitude && home.longitude);
  }, [careHomes]);

  // Transform staff data for map display
  const mapStaff = useMemo(() => {
    if (!staff) return [];
    
    const mappedStaff = staff.map((member: any) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      latitude: member.latitude,
      longitude: member.longitude,
      experience: member.experience,
      hourly_rate: member.hourly_rate,
      maxDistance: member.maxDistance,
      postcode: member.postcode,
      isAvailable: member.isAvailable,
      status: member.status,
      statusColor: member.statusColor,
      statusDescription: member.statusDescription,
      lastActive: member.lastActive,
      shiftCount: member.shiftCount,
      rating: member.rating,
    }));
    
    const filteredStaff = mappedStaff.filter((member: any) => member.latitude && member.longitude);
    
    console.log(`🗺️ Staff mapping: ${mappedStaff.length} total staff, ${filteredStaff.length} with coordinates`);
    console.log('Sample staff coordinates:', mappedStaff.slice(0, 3).map(s => ({ 
      name: s.name, 
      lat: s.latitude, 
      lng: s.longitude 
    })));
    
    return filteredStaff;
  }, [staff]);

  // Filter care homes based on current filters
  const filteredCareHomes = useMemo(() => {
    return mapCareHomes.filter((home) => {
      if (filters.region && filters.region !== 'all' && home.region !== filters.region) return false;
      if (filters.engagementLevel && filters.engagementLevel !== 'all' && home.engagementLevel !== filters.engagementLevel) return false;
      if (filters.searchTerm && !home.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [mapCareHomes, filters]);

  // Filter staff based on current filters and selected care home
  const filteredStaff = useMemo(() => {
    let filtered = mapStaff.filter((member) => {
      if (filters.region && filters.region !== 'all' && member.region !== filters.region) return false;
      if (filters.staffRole && filters.staffRole !== 'all' && member.role !== filters.staffRole) return false;
      // If care home filter is selected, show only staff near that care home
      if (filters.careHome && filters.careHome !== 'all') {
        const selectedHome = mapCareHomes.find(home => home.id === filters.careHome);
        if (selectedHome && selectedHome.latitude && selectedHome.longitude && member.latitude && member.longitude) {
          const distance = calculateDistance(
            selectedHome.latitude,
            selectedHome.longitude,
            member.latitude,
            member.longitude
          );
          return distance <= filters.radiusKm * 0.621371; // Convert km to miles
        }
        return false;
      }
      return true;
    });

    // If a care home is selected, filter staff within radius
    if (selectedCareHome && selectedCareHome.latitude && selectedCareHome.longitude) {
      filtered = filtered.filter((member) => {
        if (!member.latitude || !member.longitude) return false;
        const distance = calculateDistance(
          selectedCareHome.latitude!,
          selectedCareHome.longitude!,
          member.latitude,
          member.longitude
        );
        return distance <= filters.radiusKm * 0.621371; // Convert km to miles
      });
    }

    // Debug logging for filtered staff
    console.log(`🗺️ Filtered staff: ${filtered.length} total`);
    const hcas = filtered.filter(s => s.role === 'Healthcare Assistant');
    console.log(`🏥 Healthcare Assistants: ${hcas.length} - Names: ${hcas.map(h => h.name).join(', ')}`);
    
    return filtered;
  }, [mapStaff, filters, selectedCareHome]);

  // Calculate summary statistics for user stories
  const summaryStats = useMemo(() => {
    const totalCareHomes = filteredCareHomes.length;
    const engagementCounts = filteredCareHomes.reduce((acc, home) => {
      acc[home.engagementLevel] = (acc[home.engagementLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalStaff = filteredStaff.length;
    const availableStaff = filteredStaff.filter(member => member.isAvailable).length;
    
    // Status breakdown for enhanced analytics
    const statusBreakdown = filteredStaff.reduce((acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Staff by role counts for strategic hiring analysis
    const staffByRole = filteredStaff.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Regional coverage analysis for directors
    const regionalCoverage = filteredStaff.reduce((acc, member) => {
      const region = member.region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { total: 0, hca: 0, nurses: 0, available: 0 };
      }
      acc[region].total++;
      if (member.role === 'Healthcare Assistant') acc[region].hca++;
      if (member.role === 'Registered Nurse') acc[region].nurses++;
      if (member.isAvailable) acc[region].available++;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalCareHomes,
      engagementCounts,
      totalStaff,
      availableStaff,
      statusBreakdown,
      staffByRole,
      regionalCoverage,
    };
  }, [filteredCareHomes, filteredStaff]);

  // Calculate HCA proximity for selected care home (recruiter user story)
  const proximityAnalysis = useMemo(() => {
    if (!selectedCareHome || !selectedCareHome.latitude || !selectedCareHome.longitude) {
      return null;
    }

    const hcaWithin10km = mapStaff.filter(member => {
      if (member.role !== 'Healthcare Assistant' || !member.latitude || !member.longitude) return false;
      const distance = calculateDistance(
        selectedCareHome.latitude!,
        selectedCareHome.longitude!,
        member.latitude,
        member.longitude
      );
      return distance <= 6.21371; // 10km in miles
    });

    const availableHCAs = hcaWithin10km.filter(member => member.isAvailable);

    return {
      totalHCAs: hcaWithin10km.length,
      availableHCAs: availableHCAs.length,
      hcaList: hcaWithin10km
    };
  }, [selectedCareHome, mapStaff]);

  if (isLoadingMapData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  // Get unique regions and roles for filters
  const uniqueRegions = [...new Set(mapCareHomes.map(home => home.region).filter(Boolean))];
  const uniqueRoles = [...new Set(mapStaff.map(member => member.role).filter(Boolean))];
  
  // Combine current regions with all UK sub-regions for comprehensive filtering
  const allRegions = [...new Set([...uniqueRegions, ...UK_SUB_REGIONS])].sort();

  // Handle region change with auto-zoom
  const handleRegionChange = (region: string) => {
    setFilters(prev => ({ ...prev, region }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UK Map View</h2>
          <p className="text-muted-foreground">Care Home Engagement & Staff Coverage</p>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Care Homes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCareHomes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  Full
                </Badge>
                <span className="text-sm font-medium">{summaryStats.engagementCounts.full_engagement || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                  Some
                </Badge>
                <span className="text-sm font-medium">{summaryStats.engagementCounts.some_engagement || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  None
                </Badge>
                <span className="text-sm font-medium">{summaryStats.engagementCounts.no_engagement || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Staff Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalStaff}</div>
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Available</span>
                </div>
                <span className="text-xs font-medium">{summaryStats.statusBreakdown.available || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-xs">Busy</span>
                </div>
                <span className="text-xs font-medium">{summaryStats.statusBreakdown.busy || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs">Unavailable</span>
                </div>
                <span className="text-xs font-medium">{summaryStats.statusBreakdown.unavailable || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs">Break</span>
                </div>
                <span className="text-xs font-medium">{summaryStats.statusBreakdown.break || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs">Travelling</span>
                </div>
                <span className="text-xs font-medium">{summaryStats.statusBreakdown.travelling || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {selectedCareHome ? (
                <>
                  <p className="font-medium">{selectedCareHome.name}</p>
                  <p className="text-xs text-muted-foreground">{filteredStaff.length} staff within {filters.radiusKm}km</p>
                </>
              ) : (
                <p className="text-muted-foreground">Select a care home</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Care home name..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={filters.region} onValueChange={(value) => handleRegionChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">All regions</SelectItem>
                  {allRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="engagement">Engagement Level</Label>
              <Select value={filters.engagementLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, engagementLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="full_engagement">Full Engagement</SelectItem>
                  <SelectItem value="some_engagement">Some Engagement</SelectItem>
                  <SelectItem value="no_engagement">No Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="staffRole">Staff Role</Label>
              <Select value={filters.staffRole} onValueChange={(value) => setFilters(prev => ({ ...prev, staffRole: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="careHome">Care Home</Label>
              <Select value={filters.careHome} onValueChange={(value) => setFilters(prev => ({ ...prev, careHome: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All care homes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All care homes</SelectItem>
                  {mapCareHomes.map(home => (
                    <SelectItem key={home.id} value={home.id}>{home.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="radius">Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                min="1"
                max="100"
                value={filters.radiusKm}
                onChange={(e) => setFilters(prev => ({ ...prev, radiusKm: parseInt(e.target.value) || 25 }))}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  region: 'all',
                  engagementLevel: 'all',
                  staffRole: 'all',
                  careHome: 'all',
                  searchTerm: '',
                  radiusKm: 25,
                })}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proximity Analysis Panel (Recruiter User Story) */}
      {proximityAnalysis && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              HCA Proximity Analysis - {selectedCareHome.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{proximityAnalysis.totalHCAs}</div>
                <p className="text-sm text-muted-foreground">Total HCAs within 10km</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{proximityAnalysis.availableHCAs}</div>
                <p className="text-sm text-muted-foreground">Available HCAs</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">
                  {proximityAnalysis.totalHCAs > 0 ? Math.round((proximityAnalysis.availableHCAs / proximityAnalysis.totalHCAs) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Availability Rate</p>
              </div>
            </div>
            {proximityAnalysis.hcaList.length > 0 && (
              <div className="mt-4">
                <Separator className="mb-3" />
                <h4 className="font-medium mb-2">Available HCAs for Quick Matching:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {proximityAnalysis.hcaList.slice(0, 6).map((hca: any) => (
                    <div key={hca.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm">{hca.name}</p>
                        <p className="text-xs text-muted-foreground">{hca.postcode} • {hca.experience}y exp</p>
                      </div>
                      <Badge variant={hca.is_available ? "default" : "secondary"}>
                        {hca.is_available ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Regional Coverage Analysis (Director User Story) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Regional Staff Coverage Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summaryStats.regionalCoverage).map(([region, stats]) => (
              <div key={region} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{region}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Staff:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>HCAs:</span>
                    <span className="font-medium text-blue-600">{stats.hca}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Nurses:</span>
                    <span className="font-medium text-green-600">{stats.nurses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span className="font-medium text-amber-600">{stats.available}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stats.total > 0 ? (stats.available / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% available
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            UK Coverage Map
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Full Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Some Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>No Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Busy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>On Break</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Travelling</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full">
            <MapContainer
              center={[54.5, -3]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapController targetRegion={filters.region} />
              
              {/* Care Home Markers */}
              {filteredCareHomes.map((home) => (
                <Marker
                  key={home.id}
                  position={[home.latitude!, home.longitude!]}
                  icon={createCustomIcon(getEngagementColor(home.engagementLevel), 'home')}
                  eventHandlers={{
                    click: () => {
                      setSelectedCareHome(home);
                      setShowStaffRadius(true);
                    },
                  }}
                >
                  <Popup>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{home.name}</h3>
                      <p className="text-sm text-muted-foreground">{home.address}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={home.engagementLevel === 'full_engagement' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {home.engagementLevel === 'full_engagement' ? 'Full Engagement' :
                           home.engagementLevel === 'some_engagement' ? 'Some Engagement' : 'No Engagement'}
                        </Badge>
                      </div>
                      {home.lastContactedDate && (
                        <p className="text-xs text-muted-foreground">
                          Last contacted: {new Date(home.lastContactedDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="text-xs">
                        <p>Total Shifts: {home.totalShifts}</p>
                        <p>Filled: {home.filledShifts} | Unfilled: {home.unfilledShifts}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Staff Markers */}
              {filteredStaff.map((member, index) => {
                // Map status to hex colors for markers
                const statusColors = {
                  'available': '#10b981',
                  'busy': '#f97316', 
                  'unavailable': '#ef4444',
                  'break': '#eab308',
                  'travelling': '#3b82f6'
                };
                
                const markerColor = statusColors[member.status as keyof typeof statusColors] || '#6b7280';
                
                // Debug log for each staff marker being rendered
                console.log(`🔵 Rendering staff marker: ${member.name} (${member.role}) at lat=${member.latitude}, lng=${member.longitude}, status=${member.status}, color=${markerColor}`);
                
                return (
                  <Marker
                    key={`staff-${member.id}-${index}`}
                    position={[member.latitude!, member.longitude!]}
                    icon={createCustomIcon(markerColor, 'staff')}
                    zIndexOffset={1000 + index} // Ensure staff markers are above other elements
                  >
                    <Popup>
                      <div className="space-y-2">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm">{member.role}</p>
                        <Badge 
                          variant={member.status === 'available' ? 'default' : 'secondary'} 
                          className="text-xs"
                          style={{ backgroundColor: member.statusColor }}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {member.statusDescription}
                        </p>
                        <div className="space-y-1 text-xs">
                          <p><strong>Experience:</strong> {member.experience} years</p>
                          <p><strong>Max distance:</strong> {member.maxDistance} miles</p>
                          <p><strong>Shifts completed:</strong> {member.shiftCount}</p>
                          <p><strong>Rating:</strong> {member.rating}/5 stars</p>
                          <p><strong>Last active:</strong> {new Date(member.lastActive).toLocaleDateString()}</p>
                        </div>
                        {selectedCareHome && (
                          <p className="text-xs text-muted-foreground">
                            <strong>Distance:</strong> {calculateDistance(
                              selectedCareHome.latitude!,
                              selectedCareHome.longitude!,
                              member.latitude!,
                              member.longitude!
                            ).toFixed(1)} miles
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Selected Care Home Details */}
      {selectedCareHome && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedCareHome.name} - Staff Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium mb-2">Care Home Details</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Address:</strong> {selectedCareHome.address}</p>
                  <p><strong>Postcode:</strong> {selectedCareHome.postcode}</p>
                  <p><strong>Region:</strong> {selectedCareHome.region}</p>
                  <p><strong>County:</strong> {selectedCareHome.county}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Engagement Status</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={selectedCareHome.engagementLevel === 'full_engagement' ? 'default' : 'secondary'}
                    >
                      {selectedCareHome.engagementLevel === 'full_engagement' ? 'Full Engagement' :
                       selectedCareHome.engagementLevel === 'some_engagement' ? 'Some Engagement' : 'No Engagement'}
                    </Badge>
                  </div>
                  {selectedCareHome.lastContactedDate && (
                    <p>Last contacted: {new Date(selectedCareHome.lastContactedDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Staff in Area ({filters.radiusKm}km radius)</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Total Staff:</strong> {filteredStaff.length}</p>
                  <p><strong>Available:</strong> {filteredStaff.filter(s => s.is_available).length}</p>
                  <p><strong>Unavailable:</strong> {filteredStaff.filter(s => !s.is_available).length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}