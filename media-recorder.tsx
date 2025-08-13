import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff, Play, Pause, Square, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaRecorderProps {
  onRecordingComplete?: (blob: Blob, type: 'audio' | 'video') => void;
  maxDuration?: number; // in seconds
  recordingType?: 'audio' | 'video' | 'both';
}

export default function MediaRecorder({ 
  onRecordingComplete, 
  maxDuration = 300, // 5 minutes default
  recordingType = 'both' 
}: MediaRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      setMediaType(type);
      
      const constraints = type === 'video' 
        ? { video: true, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: type === 'video' ? 'video/webm' : 'audio/webm'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: type === 'video' ? 'video/webm' : 'audio/webm' 
        });
        setRecordedBlob(blob);
        onRecordingComplete?.(blob, type);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
      toast({
        title: "Recording started",
        description: `${type === 'video' ? 'Video' : 'Audio'} recording in progress`,
      });
      
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone/camera. Please check permissions.",
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
        title: "Recording stopped",
        description: "Recording completed successfully",
      });
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      
      if (mediaType === 'video' && videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.play();
        setIsPlaying(true);
        
        videoRef.current.onended = () => setIsPlaying(false);
      } else if (mediaType === 'audio' && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => setIsPlaying(false);
      }
    }
  };

  const pausePlayback = () => {
    if (mediaType === 'video' && videoRef.current) {
      videoRef.current.pause();
    } else if (mediaType === 'audio' && audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.${mediaType === 'video' ? 'webm' : 'webm'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Media Recorder</span>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              REC {formatTime(recordingTime)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Preview */}
        {(recordingType === 'video' || recordingType === 'both') && (
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            {!isRecording && !recordedBlob && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Video className="h-12 w-12 opacity-50" />
              </div>
            )}
          </div>
        )}

        {/* Audio Visualizer Placeholder */}
        {recordingType === 'audio' && (
          <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
            <div className="flex space-x-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-blue-500 rounded-full transition-all duration-150 ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: isRecording 
                      ? `${Math.random() * 40 + 10}px` 
                      : '20px'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} className="hidden" />

        {/* Recording Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          {!isRecording ? (
            <>
              {(recordingType === 'audio' || recordingType === 'both') && (
                <Button 
                  onClick={() => startRecording('audio')}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Record Audio
                </Button>
              )}
              {(recordingType === 'video' || recordingType === 'both') && (
                <Button 
                  onClick={() => startRecording('video')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Video className="h-4 w-4" />
                  Record Video
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={stopRecording}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>

        {/* Playback Controls */}
        {recordedBlob && !isRecording && (
          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
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
              onClick={downloadRecording}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        )}

        {/* Recording Info */}
        {recordedBlob && (
          <div className="text-sm text-gray-600 text-center">
            {mediaType === 'video' ? 'Video' : 'Audio'} recorded • 
            {' '}{Math.round(recordedBlob.size / 1024)} KB •
            {' '}{formatTime(recordingTime)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}