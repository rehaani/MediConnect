

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove, get } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Loader2, User, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, User as UserType } from "@/lib/auth";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

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

  const resetCallState = () => {
    setPc(null);
    setLocalStream(null);
    setRemoteStream(null);
    setRoomId(null);
    setCallStatus("idle");
    setIsMuted(false);
    setIsVideoEnabled(true);
  }

  const navigateToDashboard = useCallback(async () => {
    try {
      // Force a fresh fetch of the user to get the correct, current role.
      const currentUser = await getCurrentUser(user?.role);
      const role = currentUser.role || 'patient';
      const path = {
        provider: '/provider-dashboard',
        patient: '/patient-dashboard',
        admin: '/admin-dashboard',
      }[role];
      router.push(path || '/login');
    } catch (error) {
      console.error("Failed to get user role, redirecting to login.", error);
      // If getting the user fails, they are likely unauthenticated.
      router.push('/login');
    }
  }, [router, user?.role]);

  const hangUp = useCallback(async () => {
    if (callStatus === 'ended') return;

    setCallStatus("ended");
    
    if (pc) {
      pc.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (roomId) {
      const roomRef = ref(db, `calls/${roomId}`);
      try {
        // No need to wait for removal, just trigger it.
        remove(roomRef);
      } catch (error) {
        console.error("Error during hangup cleanup:", error);
      }
    }
    
    toast({ title: "Call ended." });
    
    // Use a timeout to allow the user to see the "Call Ended" message
    // before redirecting them based on their fresh role.
    setTimeout(() => {
      resetCallState();
      navigateToDashboard();
    }, 2000);
  }, [pc, localStream, roomId, toast, callStatus, navigateToDashboard]);
  
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
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    if (!localStream) {
      getCameraPermission();
    }
  }, [localStream, toast]);
  

  useEffect(() => {
    if (!localStream || !roomId || callStatus !== 'idle' || !user) {
        return;
    }
    
    const setupCall = async () => {
        const newPc = new RTCPeerConnection(servers);
        setPc(newPc);

        localStream.getTracks().forEach(track => newPc.addTrack(track, localStream));

        newPc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        const roomRef = ref(db, `calls/${roomId}`);
        onDisconnect(roomRef).remove();

        if (isHost) {
            setCallStatus("creating");
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
                if (answerDescription && newPc.currentRemoteDescription?.type !== 'answer') {
                    newPc.setRemoteDescription(new RTCSessionDescription(answerDescription))
                        .then(() => setCallStatus("active"))
                        .catch(e => console.error("Error setting remote description:", e));
                }
            });

            onValue(ref(db, `calls/${roomId}/answerCandidates`), (snapshot) => {
                snapshot.forEach(childSnapshot => {
                    newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val())).catch(e => console.error("Error adding received ICE candidate", e));
                    remove(childSnapshot.ref);
                });
            });

        } else { 
            setCallStatus("creating");
            const callSnapshot = await get(roomRef);
            if (!callSnapshot.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Call room not found.' });
                setCallStatus("ended");
                return;
            }

            newPc.onicecandidate = event => {
                if (event.candidate) {
                    const candidateRef = ref(db, `calls/${roomId}/answerCandidates/${Math.random().toString(36).substr(2, 9)}`);
                    set(candidateRef, event.candidate.toJSON());
                }
            };

            const offerDescription = callSnapshot.val().offer;
            await newPc.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const answerDescription = await newPc.createAnswer();
            await newPc.setLocalDescription(answerDescription);
            const answer = { sdp: answerDescription.sdp, type: answerDescription.type };
            await set(ref(db, `calls/${roomId}/answer`), answer);
            
            setCallStatus("active");

            onValue(ref(db, `calls/${roomId}/offerCandidates`), (snapshot) => {
                snapshot.forEach(childSnapshot => {
                    newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val())).catch(e => console.error("Error adding received ICE candidate", e));
                    remove(childSnapshot.ref);
                });
            });
        }
    };
    
    setupCall();

  }, [isHost, roomId, localStream, callStatus, user, toast]);
  
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
      navigator.clipboard.writeText(`${window.location.origin}/video-consultation?roomId=${roomId}`);
      toast({title: "Invite link copied to clipboard!"});
    }
  }

  if (!localStream) {
    return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Camera Access Required</CardTitle>
            </CardHeader>
            <CardContent>
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Action Needed</AlertTitle>
                    <AlertDescription>
                        Please allow camera and microphone access in your browser settings to use this feature. You may need to refresh the page after granting permissions.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  if (!roomId || !user) {
    return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Video Consultation</CardTitle>
                <CardDescription>Preparing session...</CardDescription>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </CardContent>
        </Card>
    )
  }

  return (
      <div className="relative h-[calc(100vh-10rem)] w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className={cn("h-full w-full object-cover", { 'hidden': !remoteStream })} />

          {!remoteStream && callStatus !== "ended" && (
              <div className="text-center text-muted-foreground z-10 flex flex-col items-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin"/>
                  <p className="mt-4 text-lg">
                    { (callStatus === 'creating' || callStatus === 'idle') && "Preparing your secure connection..." }
                    { callStatus === 'waiting' && "Waiting for patient to join..." }
                  </p>
                  {isHost && callStatus === 'waiting' && (
                    <div className="mt-4 p-4 bg-background/80 rounded-lg">
                        <p className="font-semibold">Share this link with the patient to join:</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <Button variant="ghost" size="icon" onClick={copyRoomId} aria-label="Copy Invite Link">
                                <Copy className="h-5 w-5" />
                           </Button>
                           <span className="text-sm text-muted-foreground">Copy Invite Link</span>
                        </div>
                    </div>
                  )}
              </div>
          )}
          
           <div className={cn("absolute top-4 right-4 h-48 w-72 rounded-lg overflow-hidden border-2 border-primary z-20 transition-opacity", localStream ? "opacity-100" : "opacity-0")}>
               <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
               {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <VideoOff className="text-white h-12 w-12"/>
                  </div>
              )}
          </div>

          {callStatus === "active" && (
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
