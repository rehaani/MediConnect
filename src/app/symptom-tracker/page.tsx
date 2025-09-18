import SymptomTracker from "@/components/symptom-tracker/symptom-tracker";

export default function SymptomTrackerPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Symptom Tracker</h1>
          <p className="text-muted-foreground">
            Log your daily symptoms to help track your health journey.
          </p>
        </div>
        <SymptomTracker />
      </div>
    </div>
  );
}
