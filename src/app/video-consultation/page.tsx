
"use client";
import WebRTCVideoCall from "@/components/video-consultation/webrtc-video-call";
import { Suspense } from "react";

function VideoConsultationContent() {
  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Video Consultation</h1>
          <p className="text-muted-foreground">
            Connect with your healthcare provider face-to-face.
          </p>
        </div>
        <WebRTCVideoCall />
      </div>
    </div>
  );
}

export default function VideoConsultationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoConsultationContent />
    </Suspense>
  )
}
