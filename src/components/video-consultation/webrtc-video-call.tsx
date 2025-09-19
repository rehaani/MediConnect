
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, set, onDisconnect, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

// Using a public STUN server
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
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: "destructive",
        title: "Media Access Denied",
        description: "Please enable camera and microphone permissions.",
      });
      return null;
    }
  }, [toast]);

  const createPeerConnection = useCallback(() => {
    const newPc = new RTCPeerConnection(servers);
    
    newPc.onicecandidate = (event) => {
        if (event.candidate) {
            const offerCandidatesRef = ref(db, `calls/${currentRoomId}/offerCandidates`);
            set(ref(db, `calls/${currentRoomId}/offerCandidates/${event.candidate.candidate}`), event.candidate.toJSON());
        }
    };

    newPc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };
    
    return newPc;
  }, [currentRoomId]);

  const createRoom = useCallback(async () => {
    const stream = await setupStreams();
    if (!stream) return;

    const newPc = createPeerConnection();
    
    stream.getTracks().forEach(track => {
      newPc.addTrack(track, stream);
    });
    
    const roomRef = ref(db, 'calls');
    const newRoomRef = ref(db, `calls/${Math.random().toString(36).substring(2, 11)}`);
    const newRoomId = newRoomRef.key!;
    setCurrentRoomId(newRoomId);
    setIsCallActive(true);

    const offerDescription = await newPc.createOffer();
    await newPc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await set(newRoomRef, { offer });

    onValue(ref(db, `calls/${newRoomId}/answer`), (snapshot) => {
      if (snapshot.exists() && !newPc.currentRemoteDescription) {
        const answerDescription = new RTCSessionDescription(snapshot.val());
        newPc.setRemoteDescription(answerDescription);
      }
    });

    onValue(ref(db, `calls/${newRoomId}/answerCandidates`), (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.exists()) {
          newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val()));
        }
      });
    });

    setPc(newPc);

    onDisconnect(newRoomRef).remove();
    
  }, [setupStreams, createPeerConnection]);

  const joinRoom = useCallback(async () => {
    if (!roomId) {
        toast({variant: "destructive", title: "Room ID required"});
        return;
    }
    const stream = await setupStreams();
    if (!stream) return;

    setCurrentRoomId(roomId);
    const newPc = new RTCPeerConnection(servers);

    stream.getTracks().forEach(track => {
      newPc.addTrack(track, stream);
    });

    newPc.onicecandidate = (event) => {
        if (event.candidate) {
            set(ref(db, `calls/${roomId}/answerCandidates/${event.candidate.candidate}`), event.candidate.toJSON());
        }
    };

    newPc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    const roomRef = ref(db, `calls/${roomId}`);
    onValue(roomRef, async (snapshot) => {
        if(snapshot.exists()) {
            const val = snapshot.val();
            if (val.offer) {
                await newPc.setRemoteDescription(new RTCSessionDescription(val.offer));
                const answerDescription = await newPc.createAnswer();
                await newPc.setLocalDescription(answerDescription);
                const answer = {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                };
                await set(ref(db, `calls/${roomId}/answer`), answer);

                 onValue(ref(db, `calls/${roomId}/offerCandidates`), (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        if(childSnapshot.exists()){
                            newPc.addIceCandidate(new RTCIceCandidate(childSnapshot.val()));
                        }
                    });
                });
            }
        }
    }, { onlyOnce: true });

    setIsCallActive(true);
    setPc(newPc);
  }, [roomId, setupStreams, toast]);

  const hangUp = async () => {
    pc?.close();
    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    if (currentRoomId) {
      await remove(ref(db, `calls/${currentRoomId}`));
    }

    setIsCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
    setPc(null);
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
                <hr className="flex-grow"/> <span className="text-muted-foreground">OR</span> <hr className="flex-grow"/>
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
                 <div className="relative aspect-video rounded-lg bg-muted overflow-hidden">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"/>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm p-1 rounded">
                        Remote Feed
                    </div>
                </div>
            </div>
            <Alert>
                <AlertTitle className="flex items-center justify-between">
                    <span>Room ID: {currentRoomId}</span>
                    <Button variant="ghost" size="icon" onClick={copyRoomId}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </AlertTitle>
                <AlertDescription>Share this ID with the other person to join the call.</AlertDescription>
            </Alert>
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

