
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove, get, update } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Loader2, User, UserCheck, PhoneCall, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, User as UserType } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function generateRoomId() {
    return Math.random().toString(36).substring(2, 9);
}


export default function WebRTCVideoCall() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const [user, setUser] = useState<UserType | null>(null);
  
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [callState, setCallState] = useState<"idle" | "loading" | "creating" | "waiting" | "active" | "ended">("idle");

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const [joinRoomId, setJoinRoomId] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const isHost = user?.role === 'provider';

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
        setTimeout(() => router.push(path), 2000); // Add a delay to show message
    }

  }, [pc, localStream, remoteStream, currentRoomId, toast, callState, router, user]);

  useEffect(() => {
    const fetchUser = async () => {
        const userData = await getCurrentUser();
        setUser(userData);
    };
    fetchUser();
  }, []);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
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

  const handleCreateRoom = async () => {
    setCallState("creating");
    const newRoomId = generateRoomId();
    setCurrentRoomId(newRoomId);
    
    const stream = await startLocalStream();
    if (!stream) {
      setCallState('idle');
      return;
    }

    const newPc = new RTCPeerConnection(servers);
    setPc(newPc);
    stream.getTracks().forEach(track => newPc.addTrack(track, stream));

    const roomRef = ref(db, `calls/${newRoomId}`);
    const offerCandidatesRef = ref(db, `calls/${newRoomId}/offerCandidates`);
    const answerCandidatesRef = ref(db, `calls/${newRoomId}/answerCandidates`);
    const answerRef = ref(db, `calls/${newRoomId}/answer`);

    onDisconnect(roomRef).remove();
    
    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${newRoomId}/offerCandidates/${generateRoomId()}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    const offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await set(roomRef, { offer, createdAt: Date.now() });

    setCallState("waiting");

    onValue(answerRef, async (snapshot) => {
        if (snapshot.exists()) {
            if (!newPc.currentRemoteDescription) {
              const answerDescription = new RTCSessionDescription(snapshot.val());
              await newPc.setRemoteDescription(answerDescription);
              setCallState("active");
            }
        }
    });

    onValue(answerCandidatesRef, snapshot => {
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.exists()) {
                const candidate = new RTCIceCandidate(childSnapshot.val());
                newPc.addIceCandidate(candidate).catch(e => console.error("Error adding answer candidate", e));
                remove(childSnapshot.ref);
            }
        });
    });

    newPc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    newPc.oniceconnectionstatechange = () => {
        if (newPc.iceConnectionState === 'disconnected' || newPc.iceConnectionState === 'failed' || newPc.iceConnectionState === 'closed') {
            hangUp(true);
        }
    };
  };

  const handleJoinRoom = async (roomId: string) => {
    setCallState("loading");
    setCurrentRoomId(roomId);
    
    const roomRef = ref(db, `calls/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      toast({ variant: "destructive", title: "Room not found", description: "The call may have ended or the ID is incorrect." });
      setCallState('idle');
      return;
    }

    const stream = await startLocalStream();
    if (!stream) {
      setCallState('idle');
      return;
    }
    
    const newPc = new RTCPeerConnection(servers);
    setPc(newPc);
    stream.getTracks().forEach(track => newPc.addTrack(track, stream));

    const offerCandidatesRef = ref(db, `calls/${roomId}/offerCandidates`);
    const answerRef = ref(db, `calls/${roomId}/answer`);

    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${roomId}/answerCandidates/${generateRoomId()}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    const offer = roomSnapshot.val().offer;
    await newPc.setRemoteDescription(new RTCSessionDescription(offer));

    const answerDescription = await newPc.createAnswer();
    await newPc.setLocalDescription(answerDescription);
    const answer = { sdp: answerDescription.sdp, type: answerDescription.type };
    await update(roomRef, { answer });

    setCallState("active");
    
    onValue(offerCandidatesRef, snapshot => {
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.exists()) {
                const candidate = new RTCIceCandidate(childSnapshot.val());
                newPc.addIceCandidate(candidate).catch(e => console.error("Error adding offer candidate", e));
                remove(childSnapshot.ref);
            }
        });
    });

     newPc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    newPc.oniceconnectionstatechange = () => {
        if (newPc.iceConnectionState === 'disconnected' || newPc.iceConnectionState === 'failed' || newPc.iceConnectionState === 'closed') {
            hangUp(true);
        }
    };
  };

  useEffect(() => {
    if (user && callState === 'idle') {
      const roomIdFromParams = searchParams.get("roomId");
      if (roomIdFromParams) {
          if (isHost) {
              handleCreateRoom(); // A provider rejoining is treated as creating
          } else {
              handleJoinRoom(roomIdFromParams);
          }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, callState, searchParams]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      hangUp(false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
    if (currentRoomId) {
      navigator.clipboard.writeText(currentRoomId);
      toast({title: "Room ID copied to clipboard!"});
    }
  }

  const handleManualJoin = () => {
    if(joinRoomId) handleJoinRoom(joinRoomId);
  }

  // --- RENDER LOGIC ---

  if (!user) {
     return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Video Consultation</CardTitle>
                <CardDescription>Loading user information...</CardDescription>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    )
  }

  if (callState === 'idle') {
    return (
        <Card className="max-w-lg mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Video Consultation</CardTitle>
                <CardDescription>
                    {isHost
                        ? "Start a new session and share the room ID with your patient."
                        : "Ready to connect with a healthcare provider face-to-face?"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                 <Button onClick={handleCreateRoom} size="lg" disabled={callState === 'creating'}>
                    {callState === 'creating' ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <PhoneCall className="mr-2 h-5 w-5" />
                    )}
                    {isHost ? "Start New Consultation" : "Connect to a Doctor"}
                 </Button>

                 {!isHost && (
                    <>
                        <div className="flex items-center gap-4">
                            <hr className="flex-grow border-t" />
                            <span className="text-muted-foreground text-sm">OR</span>
                            <hr className="flex-grow border-t" />
                        </div>
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Have a Room ID? Join here</Button>
                            </DialogTrigger>
                             <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Join Consultation</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="room-id" className="text-right">
                                            Room ID
                                        </Label>
                                        <Input
                                            id="room-id"
                                            value={joinRoomId}
                                            onChange={(e) => setJoinRoomId(e.target.value)}
                                            className="col-span-3"
                                            placeholder="Enter the ID from your provider"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <Button onClick={handleManualJoin} disabled={!joinRoomId}>
                                          <LogIn className="mr-2" />
                                          Join
                                      </Button>
                                    </DialogClose>
                                </DialogFooter>
                             </DialogContent>
                         </Dialog>
                    </>
                 )}
            </CardContent>
        </Card>
    );
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

  if (["loading", "creating"].includes(callState)) {
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
          {callState === 'waiting' || (callState === 'active' && !remoteStream) ? (
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
                  {isHost && (
                     <Button onClick={() => hangUp(false)} variant="destructive" className="mt-4">
                        Cancel Call
                    </Button>
                  )}
              </div>
          ) : null}
          
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
          {callState === 'active' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-4 rounded-full bg-background/80 p-3 shadow-lg z-30">
                <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} size="icon" aria-label={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button onClick={toggleVideo} variant={!isVideoEnabled ? "destructive" : "secondary"} size="icon" aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}>
                    {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>
                <Button onClick={() => hangUp(false)} variant="destructive" size="lg">
                    <PhoneOff className="mr-2" /> End Call
                </Button>
            </div>
          )}
      </div>
  )
}
