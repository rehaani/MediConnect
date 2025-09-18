import EmergencyRoutingTool from "@/components/emergency/emergency-routing-tool";

export default function EmergencyRoutingPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Emergency Routing Decision Tool</h1>
          <p className="text-muted-foreground">
            Use this AI-powered tool to determine if location data should be shared with emergency services.
          </p>
        </div>
        <EmergencyRoutingTool />
      </div>
    </div>
  );
}
