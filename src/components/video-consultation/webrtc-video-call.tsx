
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove, get, update } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Loader2, User, UserCheck } from "lucide-react";
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
  const [isHost, setIsHost] = useState(false);
  
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [callState, setCallState] = useState<"idle" | "loading" | "active" | "ended">("idle");


  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const hangUp = useCallback(async (isRemoteHangup = false) => {
    if (callState === 'ended') return;
    setCallState("ended");

    if (pc) {
      pc.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    setPc(null);
    setLocalStream(null);
    setRemoteStream(null);
    
    if (currentRoomId && !isRemoteHangup) {
      const roomRef = ref(db, `calls/${currentRoomId}`);
      try {
        await update(roomRef, { ended: true });
        await remove(roomRef);
      } catch (error) {
        console.error("Error during hangup:", error);
      }
    }
    
    const previousRoomId = currentRoomId;
    setCurrentRoomId(null);

    if (previousRoomId) {
        toast({ title: isRemoteHangup ? "The other party has ended the call." : "Call ended." });
        const currentUser = user || await getCurrentUser();
        const role = currentUser.role || 'patient';
        const path = role === 'provider' ? '/provider-dashboard' : '/patient-dashboard';
        router.push(path);
    }

  }, [pc, localStream, remoteStream, currentRoomId, toast, callState, router, user]);

  useEffect(() => {
    const fetchUser = async () => {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsHost(userData.role === 'provider');
    };
    fetchUser();
  }, []);

  // Main effect to join the call when the component mounts with a roomId
  useEffect(() => {
    if (!user) return; // Wait until user is fetched

    const roomIdFromParams = searchParams.get("roomId");
    if (roomIdFromParams && callState === 'idle') {
      setCurrentRoomId(roomIdFromParams);
      setCallState("loading");
      joinRoom(roomIdFromParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);


  const joinRoom = useCallback(async (roomId: string) => {
    const stream = await setupStreams();
    if (!stream) {
      setCallState('ended');
      return;
    };

    const newPc = initializePeerConnection(stream);
    
    const roomRef = ref(db, `calls/${roomId}`);
    onDisconnect(roomRef).remove();

    const roomSnapshot = await get(roomRef);
    
    if (!isHost && !roomSnapshot.exists()) {
        toast({variant: "destructive", title: "Room not found", description: "The call may have been ended by the host."});
        hangUp(true);
        return;
    }
    
    if (isHost) {
        newPc.onicecandidate = event => {
            if (event.candidate) {
                const candidateRef = ref(db, `calls/${roomId}/offerCandidates/${Math.random().toString(36).substring(2)}`);
                set(candidateRef, event.candidate.toJSON());
            }
        };

        const offerDescription = await newPc.createOffer();
        await newPc.setLocalDescription(offerDescription);
        const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
        await set(roomRef, { offer, ended: false });

        onValue(ref(db, `calls/${roomId}/answer`), async (snapshot) => {
            if (snapshot.exists() && !newPc.currentRemoteDescription) {
                const answerDescription = new RTCSessionDescription(snapshot.val());
                await newPc.setRemoteDescription(answerDescription);
            }
        });

        onValue(ref(db, `calls/${roomId}/answerCandidates`), (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                if (childSnapshot.exists()) {
                    newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val())).catch(e => console.error("Error adding answer candidate", e));
                    remove(childSnapshot.ref);
                }
            });
        });

    } else {
        newPc.onicecandidate = event => {
            if (event.candidate) {
                const candidateRef = ref(db, `calls/${roomId}/answerCandidates/${Math.random().toString(36).substring(2)}`);
                set(candidateRef, event.candidate.toJSON());
            }
        };
        
        const offer = roomSnapshot.val().offer;
        await newPc.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answerDescription = await newPc.createAnswer();
        await newPc.setLocalDescription(answerDescription);
        const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
        await update(roomRef, { answer });

        onValue(ref(db, `calls/${roomId}/offerCandidates`), (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                if(childSnapshot.exists()){
                    newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val())).catch(e => console.error("Error adding offer candidate", e));
                    remove(childSnapshot.ref);
                }
            });
        });
    }

    setCallState("active");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost]);

  const setupStreams = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsMuted(false);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: "destructive",
        title: "Media Access Denied",
        description: "Please enable camera and microphone permissions to start a call.",
      });
      return null;
    }
  }, [toast]);

  const initializePeerConnection = useCallback((stream: MediaStream) => {
    const newPc = new RTCPeerConnection(servers);
    
    stream.getTracks().forEach(track => newPc.addTrack(track, stream));

    newPc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    newPc.oniceconnectionstatechange = () => {
        if (newPc.iceConnectionState === 'disconnected' || newPc.iceConnectionState === 'failed' || newPc.iceConnectionState === 'closed') {
            console.log(`Peer disconnected. State: ${newPc.iceConnectionState}`);
            hangUp(true);
        }
    };
    
    setPc(newPc);
    return newPc;
  }, [hangUp]);

  // Listen for call ended state
  useEffect(() => {
    if (!currentRoomId) return;

    const roomRef = ref(db, `calls/${currentRoomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      // If room data is removed, the call has ended
      if (!snapshot.exists()) {
        hangUp(true);
      }
    });

    return () => unsubscribe();
  }, [currentRoomId, hangUp]);

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
    if (currentRoomId) {
      navigator.clipboard.writeText(currentRoomId);
      toast({title: "Room ID copied to clipboard!"});
    }
  }

  if (callState === "ended") {
    return (
      <Card className="max-w-md mx-auto text-center">
          <CardHeader>
              <CardTitle className="font-headline">Call Ended</CardTitle>
              <CardDescription>Your video call has finished. Redirecting to your dashboard...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 items-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
      </Card>
    );
}

  if (callState === "idle" || !user) {
    return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Video Consultation</CardTitle>
                <CardDescription>Preparing your secure connection...</CardDescription>
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
          {callState === 'loading' || !remoteStream && (
              <div className="text-center text-muted-foreground z-10 flex flex-col items-center">
                  <div className="flex items-center gap-4 p-4 bg-background/80 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-10 w-10 text-primary"/>
                        <span className="font-semibold">You</span>
                    </div>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin"/>
                    <div className="flex flex-col items-center gap-2">
                         <User className="h-10 w-10"/>
                        <span className="font-semibold">Connecting...</span>
                    </div>
                  </div>
                  <p className="mt-4 text-lg">Waiting for the other person to join...</p>
                  {isHost && currentRoomId && (
                    <div className="mt-4 p-4 bg-background/80 rounded-lg">
                        <p className="font-semibold">Share this Room ID with the patient:</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <span className="font-mono text-xl">{currentRoomId}</span>
                           <Button variant="ghost" size="icon" onClick={copyRoomId} aria-label="Copy Room ID">
                                <Copy className="h-5 w-5" />
                           </Button>
                        </div>
                    </div>
                  )}
                  {isHost && !remoteStream && (
                     <Button onClick={() => hangUp(false)} variant="secondary" className="mt-4">
                        Cancel Before Answer
                    </Button>
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-4 rounded-full bg-background/80 p-3 shadow-lg z-30">
              <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} size="icon" aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button onClick={toggleVideo} variant={!isVideoEnabled ? "destructive" : "secondary"} size="icon" aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}>
                  {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>
              <Button onClick={() => hangUp(false)} variant="destructive" size="lg" disabled={!isHost && callState !== 'active'}>
                  <PhoneOff className="mr-2" /> End Call
              </Button>
          </div>
      </div>
  )
}
    

    