import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Play, 
  Search, 
  Filter, 
  Download, 
  Plus,
  Clock,
  Eye,
  BookOpen,
  Video
} from "lucide-react";
import careTeam2 from "../assets/care-team-2.jpg";


interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  thumbnail: string;
  views: number;
  createdAt: string;
  instructor: string;
}

const sampleVideos: TrainingVideo[] = [
  {
    id: "1",
    title: "How to Submit a Shift Request",
    description: "Complete walkthrough of creating and submitting shift requests for care home managers",
    category: "shift-management",
    duration: 245,
    thumbnail: "/api/placeholder/320/180",
    views: 127,
    createdAt: "2024-01-15",
    instructor: "Emma Wilson"
  },
  {
    id: "2", 
    title: "Managing Staff Availability",
    description: "Learn how to view, update, and manage staff availability and scheduling preferences",
    category: "staff-recruitment",
    duration: 180,
    thumbnail: "/api/placeholder/320/180",
    views: 89,
    createdAt: "2024-01-10",
    instructor: "Sarah Johnson"
  },
  {
    id: "3",
    title: "Platform Navigation Basics",
    description: "Essential navigation tips and shortcuts for efficient platform usage",
    category: "platform-navigation",
    duration: 320,
    thumbnail: "/api/placeholder/320/180",
    views: 156,
    createdAt: "2024-01-08",
    instructor: "Admin Team"
  }
];

export default function TrainingCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Fetch training videos from API
  const { data: videos = [], isLoading: videosLoading } = useQuery({
    queryKey: ['/api/videos']
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "orientation", label: "Orientation" },
    { value: "safety", label: "Safety" },
    { value: "compliance", label: "Compliance" },
    { value: "communication", label: "Communication" }
  ];

  const filteredVideos = videos.filter((video: any) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (video.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Centre</h1>
              <p className="text-gray-600">Access instructional videos and view certification requirements</p>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={careTeam2} 
                alt="Professional healthcare training team" 
                className="w-80 h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-lg">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Video Library
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Certifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search training videos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <Play className="h-12 w-12 text-white opacity-75" />
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatDuration(video.duration)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {video.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(video.category)}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="flex items-center gap-1"
                        onClick={() => {
                          setSelectedVideo(video);
                          setShowVideoPlayer(true);
                        }}
                      >
                        <Play className="h-3 w-3" />
                        Watch
                      </Button>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Instructor: {video.instructor}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            {/* Certification Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Care Worker Certification Management</CardTitle>
                <p className="text-gray-600">
                  Understanding certification requirements and renewal schedules for care workers
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 mb-4">
                      At JoyJoy Care, we understand that maintaining current certifications is crucial for providing safe, 
                      high-quality care. Our platform automatically tracks certification expiry dates and sends timely 
                      reminders to ensure compliance. We also provide comprehensive support to help staff obtain and 
                      renew their required certifications.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-blue-900 mb-2">Our Certification Support Services</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Guidance on certification requirements for different care roles</li>
                        <li>• Assistance with renewal applications and documentation</li>
                        <li>• Training provider recommendations and partnerships</li>
                        <li>• Automatic expiry tracking with SMS and email reminders</li>
                        <li>• Document verification and compliance monitoring</li>
                        <li>• Support with funding options and training grants</li>
                      </ul>
                    </div>
                  </div>

                  {/* Certification Expiry Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Common Expiry Periods for Care Worker Certifications</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Certificate Type
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Typical Expiry
                            </th>
                            <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">DBS (Enhanced)</td>
                            <td className="border border-gray-300 px-4 py-3">3 years (recommended)</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                              No legal expiry, but many employers require renewal every 3 years.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Moving & Handling</td>
                            <td className="border border-gray-300 px-4 py-3">1 year</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                              Should be refreshed annually to stay up to date with best practices.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Health & Safety Awareness</td>
                            <td className="border border-gray-300 px-4 py-3">1–3 years</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                              Varies by role; refresher recommended every year in care settings.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Safeguarding (Adults/Children)</td>
                            <td className="border border-gray-300 px-4 py-3">1–2 years</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                              Level 2 & above typically require renewal every 2 years.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Basic Life Support / First Aid</td>
                            <td className="border border-gray-300 px-4 py-3">1 year</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                              Mandatory yearly in clinical settings.
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-3 font-medium">Fire Safety / Infection Control</td>
                            <td className="border border-gray-300 px-4 py-3">1 year</td>
                            <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                              Must be renewed annually in care homes.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Renewal Reminders</h4>
                        <p className="text-sm text-gray-700">
                          Our platform automatically sends renewal reminders at 30, 14, 7, 3, and 1 days 
                          before expiry via SMS and email to ensure you never miss a renewal deadline.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Training Support</h4>
                        <p className="text-sm text-gray-700">
                          We partner with accredited training providers to offer convenient renewal courses 
                          and can help arrange group bookings for care homes at discounted rates.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Need Help with Certifications?</h4>
                    <p className="text-gray-700 mb-3">
                      Our certification support team is here to help you maintain compliance and advance your career.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Contact Certification Team
                      </Button>
                      <Button variant="outline">
                        View Training Providers
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>

      {/* Video Player Modal */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              {selectedVideo?.category} • Uploaded {selectedVideo?.uploadedAt ? new Date(selectedVideo.uploadedAt).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  src={`/api/videos/${selectedVideo.id}/stream`}
                  poster="/api/admin/videos/placeholder-thumbnail.jpg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {selectedVideo.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedVideo.description}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Duration: {selectedVideo.duration || 'Unknown'}</span>
                <span>Category: {selectedVideo.category}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}