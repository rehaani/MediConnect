import VideoCallUI from "@/components/video-consultation/video-call-ui";

export default function VideoConsultationPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Video Consultation</h1>
          <p className="text-muted-foreground">
            Connect with your healthcare provider face-to-face.
          </p>
        </div>
        <VideoCallUI />
      </div>
    </div>
  );
}
