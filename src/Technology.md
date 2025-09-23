# MediConnect Technology Stack

This document provides a comprehensive overview of the technologies, frameworks, and libraries that power the MediConnect platform. Each component has been chosen to create a modern, scalable, and efficient telemedicine application.

---

## 1. Core Frontend Stack

These technologies form the foundation of the application's architecture and logic.

### **Next.js**
-   **Role**: Primary web framework.
-   **Description**: We use Next.js with its **App Router** paradigm, which enables a powerful, server-centric architecture. Key features we leverage include Server Components for performance, Route Handlers for creating API endpoints, file-based routing for intuitive organization, and built-in optimizations like `next/image` and `next/font`.

### **React**
-   **Role**: UI library.
-   **Description**: React is used to build the entire user interface as a collection of declarative, reusable components. We make extensive use of React Hooks (`useState`, `useEffect`, `useContext`, `useTransition`) for state management and side effects, following modern best practices.

### **TypeScript**
-   **Role**: Programming language.
-   **Description**: The entire codebase is written in TypeScript. This provides static typing, which helps catch errors during development, improves code quality and readability, and enables better autocompletion and developer tooling. We use it for defining data structures, component props, and API contracts.

---

## 2. User Interface & Styling

This group of technologies is responsible for the application's look, feel, and interactivity.

### **Tailwind CSS**
-   **Role**: CSS framework.
-   **Description**: A utility-first CSS framework used for all styling. It allows us to build complex, responsive designs directly in our markup without writing custom CSS. Our configuration (`tailwind.config.ts`) extends the base theme with custom fonts, colors, and animations.

### **ShadCN UI**
-   **Role**: Component library.
-   **Description**: ShadCN provides a set of beautifully designed and accessible UI components (like `Card`, `Button`, `Dialog`, `Form`) built on top of Radix UI and styled with Tailwind CSS. We use these components as the building blocks for our UI, which ensures consistency and saves significant development time.

### **Lucide React**
-   **Role**: Icon library.
-   **Description**: Provides a comprehensive set of clean, lightweight SVG icons. We use these icons throughout the application to improve usability and provide clear visual cues for buttons and actions.

### **Recharts**
-   **Role**: Charting library.
-   **Description**: Used in the mock Admin Analytics dashboard to render charts and graphs, visualizing platform data like user growth and feature usage.

### **Framer Motion**
-   **Role**: Animation library.
-   **Description**: Used to add fluid, declarative animations to the UI, such as the hover effects on the dashboard cards and the layout animations in the floating UI elements.

---

## 3. Artificial Intelligence

The core AI capabilities of MediConnect are powered by Google's ecosystem.

### **Genkit**
-   **Role**: AI framework.
-   **Description**: Genkit is the primary framework for building and managing all AI-powered "flows." It orchestrates calls to Large Language Models (LLMs), handles structured input/output with Zod schemas, and allows us to define complex agentic logic. We use it for the AI Symptom Analyzer, Appointment Scheduler, Document Analyzer, and WebAuthn flows.

### **Gemini Models (via Google AI)**
-   **Role**: AI models.
-   **Description**: We use various Google Gemini models through the `@genkit-ai/googleai` plugin. This includes:
    -   **`gemini-pro` / `gemini-2.5-flash`**: For fast and powerful text and multimodal analysis.
    -   **`gemini-2.5-flash-preview-tts`**: For text-to-speech functionality, such as the voice assistance on the forgot password page.

---

## 4. Backend & Data Services

These services handle data storage, authentication, and real-time communication.

### **Firebase**
-   **Role**: Backend-as-a-Service (BaaS).
-   **Description**: Firebase is a critical part of our stack, providing several key services:
    -   **Firebase Authentication**: The app is structured to use Firebase Auth for user identity, which is currently mocked.
    -   **Firebase Realtime Database**: Used as the **signaling server** for our WebRTC implementation, allowing clients to exchange connection metadata in real-time.
    -   **Firestore (Conceptual)**: While the app currently uses mock data, Firestore is the intended database for storing all persistent data like user profiles, appointments, and support tickets due to its real-time capabilities and robust security rules.

### **WebAuthn (`@simplewebauthn`)**
-   **Role**: Passwordless authentication standard.
-   **Description**: We use the `simplewebauthn` library on both the client and server (within Genkit flows) to implement secure, biometric, and passwordless authentication (passkeys). This follows the FIDO2 standard and provides a phishing-resistant login method.

---

## 5. Specialized APIs & Libraries

These are third-party libraries integrated to provide specific, high-value features.

### **WebRTC**
-   **Role**: Real-time communication API.
-   **Description**: WebRTC is a browser-native API that enables direct peer-to-peer video and audio communication. It is the foundation of our Video Consultation feature, providing low-latency, secure, and cost-effective video calls.

### **Leaflet**
-   **Role**: Mapping library.
-   **Description**: A lightweight, open-source library for creating interactive maps. We use it on the patient dashboard to display the user's live location. It is loaded dynamically from a CDN to keep the initial application bundle small.

### **Nominatim API**
-   **Role**: Geocoding service.
-   **Description**: A free, OpenStreetMap-based geocoding service. We use it to perform reverse geocoding—converting the user's latitude and longitude from the Leaflet map into a country code, which in turn powers our dynamic language suggestion feature.

### **i18next & react-i18next**
-   **Role**: Internationalization (i18n) framework.
-   **Description**: These libraries manage the translation of the application's UI into multiple languages (English, Hindi, German). The system detects the user's browser language and can also be triggered by suggestions from our mapping service.

### **React Hook Form & Zod**
-   **Role**: Form management and validation.
-   **Description**: `react-hook-form` is used for managing form state and handling submissions efficiently. We pair it with `zod` to define robust validation schemas, ensuring data integrity for user inputs across the application, from login forms to the multi-step AI Health Assessor.
