# Appointment Scheduler

### 1. Introduction
The Appointment Scheduler is an AI-enhanced feature that helps users find and book appointments with healthcare providers. It goes beyond a simple booking form by using an LLM to recommend suitable doctors based on the user's described symptoms.

### 2. Integration in MediConnect
The scheduler is a client-side component that interacts with a Genkit flow.

- **Genkit Flow**: The core logic resides in `src/ai/flows/find-doctor-flow.ts`. This flow takes the user's symptoms, desired consultation mode (video, chat, in-person), and other context as input. The prompt instructs the LLM to act as an intelligent scheduler, determine the required specialty, and generate a list of fictional but realistic doctors.
- **Frontend Component**: The `AppointmentScheduler` component (`src/components/appointments/appointment-scheduler.tsx`) manages the user's journey. It captures their symptoms and preferences, calls the Genkit flow, and displays the AI-generated doctor recommendations.
- **Two-Step Process**: The UI is split into two main views: "search" and "booking."
    1.  In "search," the user describes their needs and gets recommendations.
    2.  Once a doctor is chosen, the view switches to "booking," where the user selects an available time slot.
- **State Management**: The component uses React state to manage the user's input, the AI results, the currently selected doctor, and the list of existing appointments.

### 3. Benefits
- **Intelligent Matching**: Instead of making users guess which specialty they need, the AI does the initial triage, improving the chances of a successful patient-provider match.
- **Simplified UI**: By breaking the process into "find" and "book" steps, the user experience is less overwhelming.
- **Flexible Consultation**: Supports video, chat, and in-person modes, catering to different user needs and levels of urgency.
- **Centralized Management**: Users can view their upcoming appointments in a separate tab within the same component.

### 4. Flowchart
```mermaid
flowchart TD
  A[User opens Appointment Scheduler] --> B[User selects consultation mode]
  B --> C[User describes symptoms]
  C --> D{User clicks "Find a Doctor"}
  D --> E[API call to findDoctor(input)]
  E --> F[Genkit flow prompts LLM with symptoms]
  F --> G[LLM returns list of recommended doctors]
  G --> H{Component displays doctor cards}
  H --> I{User clicks "Book Now" on a doctor}
  I --> J[Component switches to "booking" view]
  J --> K[Time slot calendar is displayed]
  K --> L{User selects an available time slot}
  L --> M[New appointment added to state]
  M --> N[Confirmation toast is shown]
  N --> A
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
    Generate a list of fictional but realistic-sounding doctor recommendations...`,
});
```

**Calling the Flow and Handling Results (`AppointmentScheduler.tsx`):**
```javascript
const handleFindSlots = () => {
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
  setView("booking");
};
```

### 6. Testing Instructions
1.  **Find Doctors**: Enter a description of symptoms (e.g., "sore throat and fever") and select "Video Call" mode. Click "Find a Doctor." Verify that a list of relevant specialists (e.g., General Physician) is displayed.
2.  **Book Appointment**: From the list of doctors, click "Book Now." Verify the view changes to the time slot booking calendar.
3.  **Confirm Booking**: Select an available time slot. Verify that a confirmation toast appears and the new appointment is added to the "My Appointments" tab.
4.  **Cancel Appointment**: In the "My Appointments" tab, click the 'X' icon next to an appointment. Verify it is removed from the list and a cancellation toast is shown.
5.  **Input Validation**: Try to find a doctor without entering any symptoms. Verify that an error message appears.
