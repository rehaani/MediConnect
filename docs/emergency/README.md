# Emergency Response

### 1. Introduction
The Emergency Response features are integrated into the Patient Dashboard to provide critical information and actions during an emergency. This includes live location tracking and quick access to designated emergency contacts.

### 2. Integration in MediConnect
This feature combines the Leaflet map integration with a simple contact list UI, both located within the `PatientDashboard` component.

- **Location Tracking**: The live map, powered by Leaflet (see `docs/leaflet/README.md`), provides a real-time visual of the user's location. In an emergency, this map can be shared with first responders or family members.
- **Emergency Contacts**: The `PatientDashboard` component (`src/components/dashboard/patient-dashboard.tsx`) displays a list of pre-configured emergency contacts. This data is currently mocked but would be fetched from the user's profile in a production app.
- **Quick Call**: Each contact card has a "Call" button (`<Button size="icon"><Phone /></Button>`). On mobile devices, this action would trigger the native dialer with the contact's phone number.
- **LLM-based Routing (Conceptual)**: A core design goal is to use an LLM as an intelligent routing tool. The LLM would evaluate the context of an emergency (e.g., user's stated symptoms, location permissions, time of day) to decide if and how location data should be shared with emergency services, balancing privacy with safety.

### 3. Benefits
- **Fast Access**: Provides immediate access to critical actions (calling a contact) and information (live location) from the main dashboard.
- **Peace of Mind**: Gives users and their families confidence that help can be reached quickly.
- **Privacy-Aware**: The conceptual LLM router ensures that sensitive location data is only shared when appropriate and necessary, acting as a smart privacy gateway.

### 4. Flowchart
```mermaid
flowchart TD
  subgraph "Live Location"
    A[PatientDashboard loads] --> B{Geolocation API requests location}
    B --> C[Leaflet map displays live position]
  end
  
  subgraph "Emergency Contacts"
    D[Dashboard loads] --> E[Fetch emergency contacts from user profile]
    E --> F[Display contact cards with names and relationships]
  end

  subgraph "User Action"
    G{User is in an emergency} --> H{User clicks "Call" on a contact}
    H --> I[Device's native phone dialer is triggered]
  end
  
  subgraph "Future: AI Emergency Routing"
    J{Emergency triggered} --> K[Gather context: symptoms, location, user permissions]
    K --> L{EmergencyRouting LLM Tool}
    L -->|Should share location?| M[Share location with services]
    L -->|Suppress location?| N[Do not share location]
  end
```

### 5. Key Code Snippets
**Emergency Contact Display (`PatientDashboard.tsx`):**
```javascript
// Mock data, would be fetched from user profile
const emergencyContacts = [
  { name: "John Reed", relationship: "Spouse", phone: "+10987654321" },
];

// Inside the component return:
<Card>
  <CardHeader>
    <CardTitle>Emergency Contacts</CardTitle>
  </CardHeader>
  <CardContent>
    {emergencyContacts.map(contact => (
      <div key={contact.name}>
        <p>{contact.name}</p>
        <Button>
          <Phone />
        </Button>
      </div>
    ))}
  </CardContent>
</Card>
```

### 6. Testing Instructions
1.  **View Contacts**: Log in as a patient and go to the dashboard. Verify that the "Emergency Contacts" card is visible and displays the correct mock contacts.
2.  **Location Display**: Verify that the "Live Location" map card is displayed and attempts to find your location.
3.  **Call Button (UI)**: Click the "Phone" icon next to an emergency contact. While it won't trigger a real call in a browser, verify that the button is interactive and does not cause any console errors. On a mobile device, this action would ideally open the dialer.
