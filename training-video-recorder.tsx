import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Video, 
  Mic, 
  Monitor, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload,
  Camera,
  MicOff,
  VideoOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrainingVideoRecorderProps {
  onVideoComplete?: (videoData: {
    blob: Blob;
    title: string;
    description: string;
    category: string;
    duration: number;
  }) => void;
}

export default function TrainingVideoRecorder({ onVideoComplete }: TrainingVideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'camera' | 'screen'>('camera');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      let stream: MediaStream;
      
      if (recordingMode === 'screen') {
        // Screen capture with audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: true
        });
      } else {
        // Camera with audio
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      // Handle screen share ending
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (isRecording) {
          stopRecording();
        }
      });
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: `${recordingMode === 'screen' ? 'Screen' : 'Camera'} recording in progress`,
      });
      
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not start recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      toast({
        title: "Recording completed",
        description: "Your training video has been recorded successfully",
      });
    }
  };

  const playRecording = () => {
    if (recordedBlob && videoRef.current) {
      const url = URL.createObjectURL(recordedBlob);
      videoRef.current.src = url;
      videoRef.current.play();
      setIsPlaying(true);
      
      videoRef.current.onended = () => setIsPlaying(false);
    }
  };

  const pausePlayback = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadVideo = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-video-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const saveTrainingVideo = () => {
    if (recordedBlob && videoTitle && videoCategory) {
      onVideoComplete?.({
        blob: recordedBlob,
        title: videoTitle,
        description: videoDescription,
        category: videoCategory,
        duration: recordingTime
      });
      
      toast({
        title: "Training video saved",
        description: "Your instructional video has been added to the training library",
      });
      
      // Reset form
      setRecordedBlob(null);
      setVideoTitle("");
      setVideoDescription("");
      setVideoCategory("");
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Training Video Recorder</span>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                REC {formatTime(recordingTime)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Mode Selection */}
          <div className="flex gap-2">
            <Button
              variant={recordingMode === 'camera' ? 'default' : 'outline'}
              onClick={() => setRecordingMode('camera')}
              disabled={isRecording}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button
              variant={recordingMode === 'screen' ? 'default' : 'outline'}
              onClick={() => setRecordingMode('screen')}
              disabled={isRecording}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              Screen Capture
            </Button>
          </div>

          {/* Video Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls={recordedBlob && !isRecording}
              muted={isRecording}
              playsInline
            />
            {!isRecording && !recordedBlob && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2">
                {recordingMode === 'screen' ? (
                  <Monitor className="h-16 w-16 opacity-50" />
                ) : (
                  <Video className="h-16 w-16 opacity-50" />
                )}
                <p className="text-sm opacity-75">
                  {recordingMode === 'screen' 
                    ? 'Ready to capture screen and audio' 
                    : 'Ready to record with camera and microphone'}
                </p>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex gap-2 justify-center">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                className="flex items-center gap-2"
                size="lg"
              >
                {recordingMode === 'screen' ? (
                  <>
                    <Monitor className="h-4 w-4" />
                    Start Screen Recording
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    Start Camera Recording
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2"
                size="lg"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Playback Controls */}
          {recordedBlob && !isRecording && (
            <div className="flex gap-2 justify-center pt-4 border-t">
              <Button 
                onClick={isPlaying ? pausePlayback : playRecording}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Play
                  </>
                )}
              </Button>
              <Button 
                onClick={downloadVideo}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Details Form */}
      {recordedBlob && (
        <Card>
          <CardHeader>
            <CardTitle>Training Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g., How to Submit a Shift Request"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={videoCategory} onValueChange={setVideoCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shift-management">Shift Management</SelectItem>
                  <SelectItem value="staff-recruitment">Staff Recruitment</SelectItem>
                  <SelectItem value="platform-navigation">Platform Navigation</SelectItem>
                  <SelectItem value="reporting">Reporting & Analytics</SelectItem>
                  <SelectItem value="compliance">Compliance & Documentation</SelectItem>
                  <SelectItem value="communication">Communication Tools</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Provide a detailed description of what this video covers..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={saveTrainingVideo}
                disabled={!videoTitle || !videoCategory}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Save Training Video
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              Duration: {formatTime(recordingTime)} • 
              Size: {Math.round((recordedBlob?.size || 0) / 1024 / 1024)} MB
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}