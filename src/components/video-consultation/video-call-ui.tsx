"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ScreenShare, ScreenShareOff } from "lucide-react";
import { Button } from "../ui/button";

export default function VideoCallUI() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera & Mic Access Denied",
          description: "Please enable camera and microphone permissions in your browser settings to use video consultation.",
        });
      }
    };

    getCameraPermission();

    return () => {
        // Cleanup: stop the tracks when the component unmounts
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const toggleMute = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleVideo = () => {
     if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsVideoEnabled(!track.enabled);
      });
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Your Video Feed</CardTitle>
        <CardDescription>
            This is how your provider will see you. Make sure you are in a well-lit area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full rounded-md bg-muted flex items-center justify-center">
            <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
            {!isVideoEnabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                    <VideoOff className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Your video is off</p>
                </div>
            )}
        </div>
        
        {hasCameraPermission === false && (
          <Alert variant="destructive">
            <VideoOff className="h-4 w-4" />
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera and microphone access in your browser to use this feature.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4 rounded-lg bg-muted p-2">
            <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} size="icon">
                {isMuted ? <MicOff /> : <Mic />}
            </Button>
             <Button onClick={toggleVideo} variant={!isVideoEnabled ? "destructive" : "secondary"} size="icon">
                {isVideoEnabled ? <Video /> : <VideoOff />}
            </Button>
            <Button onClick={() => {toast({title: "Screen Sharing not implemented."})}} variant="secondary" size="icon" disabled>
                <ScreenShare />
            </Button>
             <Button onClick={() => {toast({title: "Call ended."})}} variant="destructive" size="icon">
                <PhoneOff />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
