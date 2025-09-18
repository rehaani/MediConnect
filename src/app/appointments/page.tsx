import AppointmentScheduler from "@/components/appointments/appointment-scheduler";

export default function AppointmentsPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Appointment Scheduler</h1>
          <p className="text-muted-foreground">
            Find and book appointments with healthcare providers.
          </p>
        </div>
        <AppointmentScheduler />
      </div>
    </div>
  );
}
