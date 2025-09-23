# MediConnect: AI-Powered Telemedicine Platform

This is the repository for MediConnect, a modern, AI-powered telemedicine platform built with Next.js, Firebase, and Google's Genkit. It is designed to provide accessible and intelligent health services, especially for rural and underserved communities.

## Core Features

-   **AI Health Assessor**: Provides preliminary health assessments based on user symptoms, including image analysis.
-   **Intelligent Appointment Scheduler**: Recommends doctors and books appointments based on user needs.
-   **Secure Video Consultations**: Real-time, peer-to-peer video calls powered by WebRTC.
-   **Multi-Role Authentication**: Secure login and registration for patients, providers, and admins using email/password and biometric (WebAuthn) methods.
-   **Personalized Dashboards**: Unique dashboard experiences for each user role.
-   **Comprehensive Admin Suite**: Tools for user management, analytics, content moderation, and support.

For a full list of features and technical details, please refer to the files in the `/docs` directory.

## Tech Stack

-   **Framework**: Next.js (with App Router)
-   **UI Library**: React & ShadCN UI
-   **Styling**: Tailwind CSS
-   **AI**: Google Genkit with Gemini models
-   **Backend Services**: Firebase (Authentication, Realtime Database for signaling)
-   **Language**: TypeScript

For a detailed breakdown, see `src/Technology.md`.

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   Firebase Account & Project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add your Firebase project configuration and other necessary environment variables.
    ```
    # Firebase Client SDK Config
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    # ... and other Firebase config keys

    # Genkit/Gemini API Key
    GEMINI_API_KEY=...

    # WebAuthn Config
    RP_ID=localhost
    RP_NAME=MediConnect
    ```

### Running the Development Server

1.  **Start the Genkit server:**
    ```bash
    npm run genkit:dev
    ```

2.  **In a separate terminal, start the Next.js development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

To deploy this application, you can use a platform like Firebase App Hosting or Vercel.

**Deploy to Firebase App Hosting:**

1.  **Build the application:**
    ```bash
    npm run build
    ```

2.  **Deploy to a preview channel:**
    ```bash
    firebase hosting:channel:deploy <channel-name> --expires 14d
    ```

3.  **Deploy to production:**
    ```bash
    firebase deploy --only hosting
    ```
