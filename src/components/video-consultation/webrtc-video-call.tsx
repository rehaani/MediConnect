
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove, get } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, User as UserType } from "@/lib/auth";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
     {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10,
};

export default function WebRTCVideoCall() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const [user, setUser] = useState<UserType | null>(null);
  
  const [roomId, setRoomId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "creating" | "waiting" | "active" | "ended">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const isHost = user?.role === 'provider';

  const hangUp = useCallback(async () => {
    if (callStatus === 'ended' || !pc) return;

    pc.close();
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    setPc(null);
    setLocalStream(null);
    setRemoteStream(null);
    
    if (roomId) {
      const roomRef = ref(db, `calls/${roomId}`);
      try {
        await remove(roomRef);
      } catch (error) {
        console.error("Error during hangup:", error);
      }
    }
    
    setCallStatus("ended");
    toast({ title: "Call ended." });
    
    // Redirect after a short delay
    setTimeout(() => {
      const role = user?.role || 'patient';
      const path = role === 'provider' ? '/provider-dashboard' : '/patient-dashboard';
      router.push(path);
    }, 2000);

  }, [pc, localStream, remoteStream, roomId, toast, callStatus, router, user?.role]);
  
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    const roomIdFromParams = searchParams.get('roomId');
    if (roomIdFromParams) {
      setRoomId(roomIdFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    const setupStreams = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
        toast({
          variant: "destructive",
          title: "Media Access Denied",
          description: "Please enable camera and microphone permissions to start a call.",
        });
      }
    };
    setupStreams();
  }, [toast]);
  

  const createRoom = async () => {
    if (!localStream) {
      toast({ variant: 'destructive', title: 'Error', description: 'Local stream is not available. Check permissions.' });
      return;
    }
    
    setCallStatus("creating");
    const newPc = new RTCPeerConnection(servers);
    setPc(newPc);

    localStream.getTracks().forEach(track => newPc.addTrack(track, localStream));

    const roomRef = ref(db, `calls/${roomId}`);
    const offerCandidates = ref(db, `calls/${roomId}/offerCandidates`);
    const answerCandidates = ref(db, `calls/${roomId}/answerCandidates`);
    
    onDisconnect(roomRef).remove();

    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${roomId}/offerCandidates/${Math.random().toString(36).substr(2, 9)}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    const offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await set(roomRef, { offer, createdAt: Date.now() });

    setCallStatus("waiting");

    onValue(ref(db, `calls/${roomId}/answer`), (snapshot) => {
        const answerDescription = snapshot.val();
        if (answerDescription && !newPc.currentRemoteDescription) {
            newPc.setRemoteDescription(new RTCSessionDescription(answerDescription));
            setCallStatus("active");
        }
    });

    onValue(answerCandidates, (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const candidate = new RTCIceCandidate(childSnapshot.val());
            newPc.addIceCandidate(candidate);
            remove(childSnapshot.ref);
        });
    });

     newPc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };
  };

  const joinRoom = async () => {
    if (!localStream || !roomId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Local stream or Room ID is missing.' });
      return;
    }

    setCallStatus("creating");
    const newPc = new RTCPeerConnection(servers);
    setPc(newPc);
    
    localStream.getTracks().forEach(track => newPc.addTrack(track, localStream));

    const roomRef = ref(db, `calls/${roomId}`);
    const offerCandidates = ref(db, `calls/${roomId}/offerCandidates`);
    const answerCandidates = ref(db, `calls/${roomId}/answerCandidates`);

    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${roomId}/answerCandidates/${Math.random().toString(36).substr(2, 9)}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    const callSnapshot = await get(roomRef);
    const offerDescription = callSnapshot.val().offer;
    await newPc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await newPc.createAnswer();
    await newPc.setLocalDescription(answerDescription);
    const answer = { sdp: answerDescription.sdp, type: answerDescription.type };
    await set(ref(db, `calls/${roomId}/answer`), answer);
    
    setCallStatus("active");

    onValue(offerCandidates, (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const candidate = new RTCIceCandidate(childSnapshot.val());
            newPc.addIceCandidate(candidate);
            remove(childSnapshot.ref);
        });
    });

     newPc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };
  };
  
  useEffect(() => {
    if (isHost && roomId && localStream && callStatus === 'idle') {
      createRoom();
    } else if (!isHost && roomId && localStream && callStatus === 'idle') {
      joinRoom();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, roomId, localStream, callStatus]);

   useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      hangUp();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      hangUp();
    };
  }, [hangUp]);

  const toggleMute = () => {
    if (localStream) {
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsMuted(!track.enabled);
        });
    }
  };

  const toggleVideo = () => {
     if (localStream) {
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            setIsVideoEnabled(!track.enabled);
        });
    }
  }

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast({title: "Room ID copied to clipboard!"});
    }
  }


  if (!roomId || !user) {
    return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Video Consultation</CardTitle>
                <CardDescription>Preparing session...</CardDescription>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    )
  }

  return (
      <div className="relative h-[calc(100vh-10rem)] w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {/* Remote Video */}
          <video ref={remoteVideoRef} autoPlay playsInline className={cn("h-full w-full object-cover", { 'hidden': !remoteStream })} />

          {/* Waiting for peer */}
          {!remoteStream && callStatus !== "ended" && (
              <div className="text-center text-muted-foreground z-10 flex flex-col items-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin"/>
                  <p className="mt-4 text-lg">Preparing your secure connection...</p>
                  {isHost && (
                    <div className="mt-4 p-4 bg-background/80 rounded-lg">
                        <p className="font-semibold">Share this Room ID with the patient:</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <span className="font-mono text-xl">{roomId}</span>
                           <Button variant="ghost" size="icon" onClick={copyRoomId} aria-label="Copy Room ID">
                                <Copy className="h-5 w-5" />
                           </Button>
                        </div>
                    </div>
                  )}
              </div>
          )}
          
          {/* Local Video (PIP) */}
           <div className={cn("absolute top-4 right-4 h-48 w-72 rounded-lg overflow-hidden border-2 border-primary z-20 transition-opacity", localStream ? "opacity-100" : "opacity-0")}>
               <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
               {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <VideoOff className="text-white h-12 w-12"/>
                  </div>
              )}
          </div>

          {/* Controls */}
          {localStream && callStatus !== "ended" && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-4 rounded-full bg-background/80 p-3 shadow-lg z-30">
                <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} size="icon" aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleVideo} variant={!isVideoEnabled ? "destructive" : "secondary"} size="icon" aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}>
                    {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>
                <Button onClick={hangUp} variant="destructive" size="lg">
                    <PhoneOff className="mr-2" /> End Call
                </Button>
            </div>
          )}

          {callStatus === "ended" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 text-white">
                <PhoneOff className="h-16 w-16 mb-4"/>
                <h2 className="text-2xl font-bold">Call Ended</h2>
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
            </div>
          )}
      </div>
  )
}
