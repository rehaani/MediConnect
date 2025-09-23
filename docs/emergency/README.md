# Emergency Response

### 1. Introduction
The Emergency Response features are integrated directly into the Patient Dashboard to provide critical information and actions during an emergency. This includes live location tracking using the device's GPS and quick access to a list of pre-configured emergency contacts.

### 2. Integration in MediConnect
This feature combines the Leaflet map integration with a simple contact list UI, both located within the `PatientDashboard` component (`src/components/dashboard/patient-dashboard.tsx`).

- **Live Location Tracking**: The map on the patient dashboard, powered by Leaflet (see `docs/leaflet/README.md`), provides a real-time visual of the user's location. The component uses the browser's `navigator.geolocation` API to request location access. If granted, the map centers on the user's position and displays a marker. In an emergency, this map could be conceptually shared with first responders or family members.
- **Graceful Degradation**: If the user denies location access, the map gracefully degrades. It displays a default, zoomed-out view (centered on India) and shows a clear, user-friendly error message explaining why location access is useful and how to enable it.
- **Emergency Contacts**: The `PatientDashboard` component displays a list of pre-configured emergency contacts. This data is currently mocked within the component but would be fetched from the user's profile in a production application.
- **Quick Call Functionality**: Each contact card has a "Call" button featuring a phone icon. On a mobile device, this action is designed to trigger the native dialer with the contact's phone number, enabling a quick call with a single tap. In a desktop browser, this button is still interactive but will not trigger a call.
- **Conceptual AI-Powered Routing**: A core design goal for a future iteration is to use an LLM as an intelligent routing tool. The LLM could evaluate the context of an emergency (e.g., user's stated symptoms from the AI Analyzer, location permissions, time of day) to decide if, when, and how location data should be shared with emergency services or family members, acting as a smart gateway that balances privacy with safety.

### 3. Benefits
- **Immediate Access**: Provides one-tap access to critical actions (calling a contact) and vital information (live location) directly from the main dashboard.
- **Peace of Mind**: Gives users and their families confidence that help can be reached quickly in an emergency.
- **User-Friendly Error Handling**: Clearly communicates with the user when location services are denied and provides guidance, preventing confusion.
- **Privacy-Centric Design (Conceptual)**: The future-state LLM router ensures that sensitive location data is only shared when appropriate and necessary.

### 4. Flowchart
```mermaid
flowchart TD
  subgraph "Live Location Feature"
    A[PatientDashboard loads] --> B{useEffect hook requests geolocation}
    B -->|Permission Granted| C[Get coordinates via Geolocation API]
    C --> D[Leaflet map displays live position with marker]
  end
  
  subgraph "Emergency Contacts Feature"
    E[Dashboard loads] --> F[Fetch emergency contacts from mock data array]
    F --> G[Display contact cards with names, relationships, and call buttons]
  end

  subgraph "User Interaction"
    H{User clicks "Call" on a contact} --> I[Triggers tel: link to open device's native phone dialer]
  end
  
  subgraph "Future: AI Emergency Routing (Conceptual)"
    J{Emergency triggered via another feature} --> K[Gather context: symptoms, location, user permissions]
    K --> L{EmergencyRouting LLM Tool}
    L -->|Is sharing justified?| M[Share location with registered emergency services]
    L -->|Privacy override?| N[Do not share location]
  end
```

### 5. Key Code Snippets
**Emergency Contact Display (`PatientDashboard.tsx`):**
```javascript
// Mock data, would be fetched from user profile in a real app
const emergencyContacts = [
  { name: "John Reed", relationship: "Spouse", phone: "+10987654321" },
];

// Inside the component's return statement:
<Card>
  <CardHeader>
    <CardTitle>Emergency Contacts</CardTitle>
  </CardHeader>
  <CardContent>
    {emergencyContacts.map(contact => (
      <div key={contact.name}>
        {/* Contact info */}
        <p>{contact.name}</p>
        <Button asChild>
          <a href={`tel:${contact.phone}`}>
            <Phone />
          </a>
        </Button>
      </div>
    ))}
  </CardContent>
</Card>
```

### 6. Testing Instructions
1.  **View Contacts**: Log in as a patient and navigate to the patient dashboard. Verify that the "Emergency Contacts" card is visible and displays the correct mock contacts.
2.  **Location Display (Grant Permission)**: When prompted by the browser for location access, click "Allow." Verify the "Live Location" map card centers on your current location and displays a marker.
3.  **Location Display (Deny Permission)**: In a new session or after resetting permissions, click "Block" when prompted for location access. Verify the map shows a default view and a user-friendly error message is displayed below it, explaining how to enable permissions.
4.  **Call Button (UI)**: Click the phone icon next to an emergency contact. While it won't trigger a real call in a desktop browser, verify that the button is interactive and does not cause any console errors. On a mobile device, this action should open the native dialer.
