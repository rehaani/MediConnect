
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove, get } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
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
  const [isCallActive, setIsCallActive] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const setupStreams = useCallback(async () => {
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

  const createRoom = useCallback(async () => {
    const stream = await setupStreams();
    if (!stream) return;

    const newPc = new RTCPeerConnection(servers);
    stream.getTracks().forEach(track => newPc.addTrack(track, stream));

    const roomRef = ref(db, 'calls');
    // Using a simpler random string for the room ID
    const newRoomId = Math.random().toString(36).substring(2, 9);
    const newRoomRef = ref(db, `calls/${newRoomId}`);

    setCurrentRoomId(newRoomId);
    setIsCallActive(true);
    
    // Setup ICE candidate listeners
    const offerCandidatesRef = ref(db, `calls/${newRoomId}/offerCandidates`);
    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${newRoomId}/offerCandidates/${event.candidate.candidate}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    // Create offer
    const offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);
    const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
    await set(newRoomRef, { offer });

    // Listen for answer
    onValue(ref(db, `calls/${newRoomId}/answer`), (snapshot) => {
      if (snapshot.exists() && !newPc.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(snapshot.val());
        newPc.setRemoteDescription(answerDescription);
      }
    });

    // Listen for answer candidates
    onValue(ref(db, `calls/${newRoomId}/answerCandidates`), (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.exists()) {
                newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val()));
            }
        });
    });

    // Listen for remote stream
    newPc.ontrack = (event) => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
        setRemoteStream(event.streams[0]);
    };

    setPc(newPc);

    // Setup cleanup on disconnect
    onDisconnect(newRoomRef).remove();
    
  }, [setupStreams]);

  const joinRoom = useCallback(async () => {
    if (!roomId) {
        toast({variant: "destructive", title: "Room ID required", description: "Please enter a room ID to join."});
        return;
    }
    
    const roomRef = ref(db, `calls/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
        toast({variant: "destructive", title: "Room not found", description: "The room ID you entered is invalid."});
        return;
    }

    const stream = await setupStreams();
    if (!stream) return;

    setCurrentRoomId(roomId);
    setIsCallActive(true);

    const newPc = new RTCPeerConnection(servers);
    stream.getTracks().forEach(track => newPc.addTrack(track, stream));

    // Setup ICE candidate listeners
    const answerCandidatesRef = ref(db, `calls/${roomId}/answerCandidates`);
    newPc.onicecandidate = event => {
        if (event.candidate) {
            const candidateRef = ref(db, `calls/${roomId}/answerCandidates/${event.candidate.candidate}`);
            set(candidateRef, event.candidate.toJSON());
        }
    };

    // Listen for remote stream
    newPc.ontrack = (event) => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
        setRemoteStream(event.streams[0]);
    };
    
    const offer = roomSnapshot.val().offer;
    await newPc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answerDescription = await newPc.createAnswer();
    await newPc.setLocalDescription(answerDescription);
    const answer = { type: answerDescription.type, sdp: answerDescription.sdp };
    await set(ref(db, `calls/${roomId}/answer`), answer);

    // Listen for offer candidates
    onValue(ref(db, `calls/${roomId}/offerCandidates`), (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if(childSnapshot.exists()){
                newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val()));
            }
        });
    });

    setPc(newPc);
  }, [roomId, setupStreams, toast]);

  const hangUp = async () => {
    pc?.close();
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    if (currentRoomId) {
      const roomRef = ref(db, `calls/${currentRoomId}`);
      await remove(roomRef);
    }

    setIsCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
    setPc(null);
    setRoomId("");
    setCurrentRoomId("");
    toast({ title: "Call ended." });
  };
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">WebRTC Video Call</CardTitle>
        <CardDescription>Create or join a video call room.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isCallActive ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={createRoom} className="flex-1">Create Room</Button>
            </div>
            <div className="flex items-center space-x-2">
                <hr className="flex-grow border-border"/> <span className="text-muted-foreground">OR</span> <hr className="flex-grow border-border"/>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={joinRoom} variant="secondary" className="flex-1">Join Room</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative aspect-video rounded-lg bg-muted overflow-hidden">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                     <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm p-1 rounded">
                        Your Feed
                    </div>
                </div>
                 <div className="relative aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"/>
                    {!remoteStream && (
                        <div className="absolute text-muted-foreground text-center">
                           <p>Waiting for the other person to join...</p>
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm p-1 rounded">
                        Remote Feed
                    </div>
                </div>
            </div>
            {currentRoomId && (
                <Alert>
                    <AlertTitle className="flex items-center justify-between">
                        <span>Room ID: {currentRoomId}</span>
                        <Button variant="ghost" size="icon" onClick={copyRoomId}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </AlertTitle>
                    <AlertDescription>Share this ID with the other person to join the call.</AlertDescription>
                </Alert>
            )}
            <div className="flex justify-center gap-4 rounded-lg bg-muted p-2">
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
        )}
      </CardContent>
    </Card>
  );
}
