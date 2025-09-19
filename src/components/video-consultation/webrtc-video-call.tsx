
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove, get } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const [roomId, setRoomId] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [callState, setCallState] = useState<"idle" | "creating" | "joining" | "active" | "ended">("idle");


  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const hangUp = useCallback(async () => {
    if (!pc && !localStream) return;

    pc?.close();

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
    }

    if (currentRoomId) {
        const roomRef = ref(db, `calls/${currentRoomId}`);
        await remove(roomRef);
    }
    
    setCallState("ended");
    setLocalStream(null);
    setRemoteStream(null);
    setPc(null);
    
    const previousRoomId = currentRoomId;
    setCurrentRoomId("");
    setRoomId("");

    if (previousRoomId) {
        toast({ title: "Call ended." });
    }

}, [pc, localStream, remoteStream, currentRoomId, toast]);

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
      setCallState("idle");
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
        if (newPc.iceConnectionState === 'disconnected' || newPc.iceConnectionState === 'failed') {
            console.log('Peer disconnected.');
            hangUp();
        }
    };
    
    setPc(newPc);
    return newPc;
  }, [hangUp]);

  const createRoom = useCallback(async () => {
    setCallState("creating");
    const stream = await setupStreams();
    if (!stream) return;

    const newPc = initializePeerConnection(stream);
    
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const roomRef = ref(db, `calls/${newRoomId}`);
    onDisconnect(roomRef).remove(); 

    setCurrentRoomId(newRoomId);
    
    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${newRoomId}/offerCandidates/${Math.random().toString(36).substring(2)}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    const offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await set(roomRef, { offer });

    setCallState("active");

    onValue(ref(db, `calls/${newRoomId}/answer`), async (snapshot) => {
      if (snapshot.exists() && newPc.currentRemoteDescription) {
         // ignore stale answers
      } else if(snapshot.exists()) {
        const answerDescription = new RTCSessionDescription(snapshot.val());
        await newPc.setRemoteDescription(answerDescription);
      }
    });

    onValue(ref(db, `calls/${newRoomId}/answerCandidates`), (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.exists()) {
                newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val())).catch(e => console.error("Error adding answer candidate", e));
                remove(childSnapshot.ref);
            }
        });
    });

  }, [setupStreams, initializePeerConnection]);

  const joinRoom = useCallback(async () => {
    if (!roomId) {
        toast({variant: "destructive", title: "Room ID required", description: "Please enter a room ID to join."});
        return;
    }
    
    setCallState("joining");
    const roomRef = ref(db, `calls/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
        toast({variant: "destructive", title: "Room not found", description: "The room ID you entered is invalid."});
        setCallState("idle");
        return;
    }

    const stream = await setupStreams();
    if (!stream) return;

    const newPc = initializePeerConnection(stream);
    setCurrentRoomId(roomId);
    
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
    await set(ref(db, `calls/${roomId}/answer`), answer);

    setCallState("active");

    onValue(ref(db, `calls/${roomId}/offerCandidates`), (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if(childSnapshot.exists()){
                newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val())).catch(e => console.error("Error adding offer candidate", e));
                remove(childSnapshot.ref);
            }
        });
    });

  }, [roomId, setupStreams, toast, initializePeerConnection]);

  
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
    navigator.clipboard.writeText(currentRoomId);
    toast({title: "Room ID copied to clipboard!"});
  }

  const isLoading = callState === "creating" || callState === "joining";

  if (callState === "active" || callState === "creating" || callState === "joining") {
    return (
        <div className="relative h-[calc(100vh-10rem)] w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {/* Remote Video */}
            <video ref={remoteVideoRef} autoPlay playsInline className={cn("h-full w-full object-cover", { 'hidden': !remoteStream })} />

            {/* Waiting for peer */}
            {!remoteStream && (
                <div className="text-center text-muted-foreground z-10">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin mb-4"/>
                    <p className="text-lg">Waiting for other person to join...</p>
                    <div className="mt-4 p-4 bg-background/80 rounded-lg">
                        <p className="font-semibold">Share this Room ID:</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                           <span className="font-mono text-xl">{currentRoomId}</span>
                           <Button variant="ghost" size="icon" onClick={copyRoomId} aria-label="Copy Room ID">
                                <Copy className="h-5 w-5" />
                           </Button>
                        </div>
                    </div>
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
                <Button onClick={hangUp} variant="destructive" size="lg">
                    <PhoneOff className="mr-2" /> End Call
                </Button>
            </div>
        </div>
    )
  }

  if(callState === "ended") {
      return (
        <Card className="max-w-md mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline">Call Ended</CardTitle>
                <CardDescription>Your video consultation has finished.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <p>Thank you for using MediConnect.</p>
                <Button onClick={() => setCallState("idle")}>Start a New Call</Button>
                <Button asChild variant="outline">
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </CardContent>
        </Card>
      );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Start or Join a Video Call</CardTitle>
        <CardDescription>Create a private room or join an existing one using a Room ID.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={createRoom} className="flex-1" disabled={isLoading}>
                    {isLoading && callState === "creating" ? <Loader2 className="animate-spin mr-2" /> : null}
                    Create Room
                </Button>
            </div>
            <div className="flex items-center space-x-2 py-2">
                <div className="flex-grow border-t border-border"/>
                <span className="text-muted-foreground text-sm">OR</span>
                <div className="flex-grow border-t border-border"/>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter Room ID to join"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={joinRoom} variant="secondary" className="flex-1" disabled={isLoading || !roomId}>
                {isLoading && callState === "joining" ? <Loader2 className="animate-spin mr-2" /> : null}
                Join Room
              </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
    

  

    