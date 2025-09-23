# Appointment Scheduler

### 1. Introduction
The Appointment Scheduler is an AI-enhanced feature that helps users find and book appointments with healthcare providers. It goes beyond a simple booking form by using a Genkit-powered LLM to intelligently recommend suitable doctors based on the user's described symptoms, streamlining the process of finding the right care.

### 2. Integration in MediConnect
The scheduler is a client-side component that interacts with a dedicated Genkit flow. The entire experience is managed within a single, tabbed interface.

- **Genkit Flow (`find-doctor-flow.ts`)**: The core AI logic resides in this flow. It takes the user's symptoms and desired consultation mode (video, chat, or in-person) as input. The prompt instructs the LLM to act as an intelligent scheduler:
    1.  Determine the most likely medical specialty based on the symptoms.
    2.  Generate a list of up to three fictional but realistic-sounding doctors matching that specialty.
    3.  For each doctor, provide a name, specialty, a reason for the recommendation, and a fictional "next available" time slot to simulate availability.
- **Frontend Component (`AppointmentScheduler.tsx`)**: The `AppointmentScheduler` component (`src/components/appointments/appointment-scheduler.tsx`) manages the entire user journey. It uses a tabbed interface to separate creating a new appointment from viewing existing ones.
- **Two-Step Booking Process**: The UI for booking a new appointment is split into two main views to simplify the user experience:
    1.  **Search View**: The user selects their preferred consultation mode, describes their symptoms, and clicks "Find a Doctor." This calls the Genkit flow and displays the AI-generated doctor recommendations as interactive cards.
    2.  **Booking View**: After the user clicks "Book Now" on a recommended doctor, the view switches to a calendar-like display of available time slots for the next 7 days. Clicking a time slot confirms the booking.
- **State Management**: The component uses React's `useState` and `useTransition` hooks to manage the user's input, the AI results, the currently selected doctor, the list of existing appointments, and the loading/error states.
- **Appointment Management**: The "My Appointments" tab displays a list of currently booked (mock) appointments. Users can cancel an appointment, which removes it from the local state and shows a confirmation toast.

### 3. Benefits
- **Intelligent Matching**: Instead of making users guess which specialty they need (e.g., "Do I need a cardiologist or a pulmonologist?"), the AI does the initial triage, improving the chances of a successful patient-provider match.
- **Simplified UI**: By breaking the process into "Find" and "Book" steps, the user experience is less overwhelming than a single, large form. The tabbed interface cleanly separates creation from management.
- **Flexible Consultation Modes**: The scheduler supports video, chat, and in-person modes, catering to different user needs and levels of urgency.
- **Centralized Management**: Users can view and cancel their upcoming appointments in a single, convenient location.

### 4. Flowchart
```mermaid
flowchart TD
  A[User opens Appointment Scheduler] --> B[User selects consultation mode and describes symptoms]
  B --> C{User clicks "Find a Doctor"}
  C --> D[Client calls the findDoctor Genkit flow]
  D --> E[Genkit prompts LLM with symptoms and context]
  E --> F[LLM returns a list of recommended doctors]
  F --> G{Component displays doctor recommendation cards}
  G --> H{User clicks "Book Now" on a doctor}
  H --> I[Component view switches to the "booking" calendar]
  I --> J[User selects an available time slot]
  J --> K[New appointment is added to local state]
  K --> L[Confirmation toast is shown, and user is returned to the main scheduler view]
```

### 5. Key Code Snippets
**Genkit Flow Prompt (`find-doctor-flow.ts`):**
```typescript
const prompt = ai.definePrompt({
  name: 'findDoctorPrompt',
  input: {schema: FindDoctorInputSchema},
  output: {schema: FindDoctorOutputSchema},
  prompt: `You are an intelligent medical appointment scheduler...
    **User Information:**
    - Symptoms: {{{symptoms}}}
    - Consultation Mode: {{{consultationMode}}}
    Generate a list of fictional but realistic-sounding doctor recommendations in India...`,
});
```

**Calling the Flow and Handling Results (`AppointmentScheduler.tsx`):**
```javascript
const handleFindSlots = () => {
  if (!symptoms) { /* show error */ return; }
  startTransition(async () => {
    const input: FindDoctorInput = {
        symptoms: symptoms,
        consultationMode: mode,
        // ...
    };
    const response = await findDoctor(input);
    setResult(response);
  });
};

const handleSelectDoctor = (doctor: Doctor) => {
  setSelectedDoctor(doctor);
  setView("booking"); // Switch to the calendar view
};

const handleBookAppointment = (slot: Date) => {
    const newAppointment: Appointment = { ... };
    setMyAppointments(prev => [...prev, newAppointment]);
    toast({ title: "Appointment Confirmed!" });
    setView("search"); // Return to the initial view
}
```

### 6. Testing Instructions
1.  **Find Doctors**: In the "New Appointment" tab, enter a description of symptoms (e.g., "sore throat and fever") and select the "Video Call" mode. Click "Find a Doctor." Verify that a loading spinner appears, followed by a list of relevant specialists (e.g., General Physician).
2.  **Book Appointment**: From the list of recommended doctors, click "Book Now" on one of them. Verify the view changes to the time slot booking calendar for that specific doctor.
3.  **Confirm Booking**: Select an available (non-disabled) time slot from the calendar. Verify that a confirmation toast appears and the view returns to the main scheduler page.
4.  **View and Cancel Appointment**: Switch to the "My Appointments" tab. Verify the newly booked appointment is present. Click the 'X' icon next to it. Verify it is removed from the list and a cancellation toast is shown.
5.  **Input Validation**: Try to click "Find a Doctor" without entering any symptoms. Verify that a local error message appears and no API call is made.
