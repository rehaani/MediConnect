# MediConnect Visual Asset Guide

This document outlines key visual diagrams and infographics that help explain the MediConnect platform's architecture, user flow, and project plan. These visuals are intended for presentations, documentation, and onboarding new team members.

---

### 1. System Architecture Diagram

**Purpose**: To provide a high-level overview of the entire technical ecosystem, illustrating how different services and technologies interact.

**Content**: A block diagram showing the flow of data and commands between the user's client, our backend services, and third-party integrations.

```mermaid
graph TD
    subgraph "User Client (Web Browser)"
        WebApp[Next.js/React Frontend]
    end

    subgraph "Firebase Platform"
        Auth[Firebase Auth]
        Firestore[Firestore Database]
        Functions[Cloud Functions]
        Hosting[App Hosting]
        RTDB[Realtime Database]
    end

    subgraph "AI & External Services"
        Genkit[Genkit AI Flows]
        WebRTC[WebRTC P2P]
        Maps[Leaflet/Nominatim]
    end
    
    WebApp -- "Login, Register" --> Auth
    WebApp -- "Read/Write Data" --> Firestore
    WebApp -- "Trigger Business Logic" --> Functions
    Hosting -- "Serves WebApp" --> WebApp
    
    Functions -- "Calls LLM" --> Genkit
    WebApp -- "Calls AI Agents" --> Genkit
    
    WebApp -- "Initiates Call" --> RTDB
    RTDB -- "Signaling" --> WebApp
    WebApp <-.-> WebRTC
    
    WebApp -- "Renders Maps" --> Maps

    style WebApp fill:#61DAFB
    style Firebase fill:#FFCA28
    style Genkit fill:#4285F4
    style WebRTC fill:#e94e39
```

---

### 2. User Journey Flowchart

**Purpose**: To trace a typical patient's journey from opening the app to completing a consultation, highlighting key decisions and interactions.

**Content**: A linear flowchart that shows the step-by-step process a user follows.

```mermaid
flowchart TD
    A[Patient opens app] --> B{Symptoms or Appointment?}
    B -->|Symptoms| C[AI Health Assessor]
    C --> D[User enters symptoms & context]
    D --> E{AI Analysis}
    E --> F{Risk Level?}
    F -->|Emergency| G[Advise calling 911]
    F -->|Low/Medium/High| H[Show assessment & recommendation]
    H --> I[Appointment Scheduler]
    B -->|Appointment| I
    I --> J[User chooses doctor/time]
    J --> K[Books Appointment]
    K --> L[Receives Confirmation]
    L --> M[At scheduled time, joins Video Call]
    M --> N[Consultation with Doctor via WebRTC]
    N --> O[Receives prescription/advice]
    O --> P[Logs medication in Medication Manager]
```

---

### 3. Geographic Coverage Map

**Purpose**: To visualize the real-world deployment area of the MediConnect pilot program.

**Implementation**: A screenshot or embedded view from a custom Leaflet map.
-   **Base Layer**: A map of the Nabha region in Punjab, India.
-   **Markers**:
    -   Blue markers for villages included in the pilot.
    -   Green cross markers for partner clinics.
    -   Red siren markers for designated emergency hubs or hospitals.
-   **Interactivity**: Clicking on a marker would show a popup with the location's name and services available.

---

### 4. Timeline / Gantt Chart

**Purpose**: To communicate the project's schedule, phases, and key deliverables to stakeholders.

**Implementation**: A Gantt chart created with Mermaid.

```mermaid
gantt
    title MediConnect Project Timeline
    dateFormat  YYYY-MM-DD
    axisFormat %b %Y
    
    section Foundation (M1-M2)
    Tech Stack & Architecture :done, 2023-01-01, 2w
    Authentication & UI Shell :done, after Tech Stack & Architecture, 4w
    
    section Core Features (M2-M4)
    AI Analyzer & Scheduler :done, 2023-02-15, 6w
    WebRTC Video & Dashboards :active, after AI Analyzer & Scheduler, 6w
    
    section Pilot Program (M5-M6)
    Onboarding & Training :2023-05-15, 4w
    Pilot Go-Live & Feedback :after Onboarding & Training, 4w
    
    section Full Launch (M7)
    Incorporate Feedback & Scale :2023-07-15, 4w
```

---

### 5. Technical Stack Infographic

**Purpose**: A quick, visual summary of the key technologies used in the project.

**Implementation**: A 2x3 grid of high-resolution logos. Each logo has a one-line caption beneath it.
-   **React**: Powering the user interface.
-   **Firebase**: For authentication, database, and backend functions.
-   **WebRTC**: Enabling secure, peer-to-peer video consultations.
-   **Leaflet**: For interactive maps and location services.
-   **Rocket.Chat**: For secure, scalable community messaging.
-   **Grafana/Superset**: For visualizing platform analytics and health trends.

---

### 6. Security & Compliance Overview

**Purpose**: To illustrate the project's commitment to data privacy and security in a single, digestible graphic.

**Implementation**: A central, large shield icon. Annotations point from the shield to key security features:
-   **Firebase Security Rules**: "Granular, rule-based access control for Firestore."
-   **Custom Claims (JWT)**: "Role-based access enforced at the token level."
-   **HIPAA-Ready Chat**: "End-to-end encryption available for all user communications."
-   **Encrypted Storage**: "All sensitive user data is encrypted at rest."

---

### 7. Performance Metrics Snapshot

**Purpose**: To provide quantitative proof of the application's responsiveness and efficiency.

**Implementation**: A simple dashboard-style card with three key metrics, each with a radial chart or a simple bar.
-   **Average Page Load Time**: `< 2s`
-   **Video Connection Time**: `< 5s`
-   **AI Analysis Response Time**: `< 3s`
