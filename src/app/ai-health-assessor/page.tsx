import HealthAssessor from "@/components/health-assessor/health-assessor";

export default function HealthAssessorPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">AI Health Assessor</h1>
          <p className="text-muted-foreground">
            Describe your symptoms to get a preliminary health assessment.
            <strong className="block mt-2 font-bold text-destructive">This is not a substitute for professional medical advice. In an emergency, call your local emergency number immediately.</strong>
          </p>
        </div>
        <HealthAssessor />
      </div>
    </div>
  );
}
