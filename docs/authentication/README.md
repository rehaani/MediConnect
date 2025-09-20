# Authentication

### 1. Introduction
Authentication is the foundation of MediConnect's security model. It provides secure, multi-role user registration and login. The system is designed to be flexible, offering standard email/password flows, phone OTP verification, and modern biometric (passkey) authentication via WebAuthn.

### 2. Integration in MediConnect
Authentication is a mix of frontend components, API routes, and Genkit flows.

- **UI Components**:
  - `LoginForm`: Handles email/password and biometric sign-in.
  - `RegisterForm`: Manages multi-role user registration.
  - `OtpForm`: For phone number verification after registration.
- **Biometric/WebAuthn**:
  - This is powered by the `simplewebauthn` library.
  - Genkit flows (`generate-registration-options-flow.ts`, `verify-registration-flow.ts`, etc.) handle the server-side logic of generating and verifying cryptographic challenges.
  - API routes (`/api/webauthn/...`) expose these flows to the client.
  - The `webauthn.ts` helper library on the client-side (`src/lib/webauthn.ts`) abstracts the browser interactions (`startRegistration`, `startAuthentication`).
- **OTP Verification**: The registration form redirects to the OTP page. In a real app, a Cloud Function would trigger an SMS service (like Twilio) to send a code, and another function would verify it.
- **Password Reset with Voice**: The forgot password form includes a "Use Voice Assistance" button which calls a Genkit `textToSpeech` flow to read the instructions aloud, improving accessibility.

### 3. Benefits
- **Multi-Factor**: Combining password/OTP with optional biometrics provides robust security.
- **Passwordless Option**: WebAuthn allows for secure, passwordless logins, which is both more convenient and phishing-resistant.
- **Accessibility**: The text-to-speech feature on the password reset page assists low-literacy users.
- **Role-Based**: Registration includes role selection, which would be used to set custom claims on the user's auth token.

### 4. Flowchart (WebAuthn Registration)
```mermaid
flowchart TD
    A[User clicks "Enable Biometric Sign-in"] --> B[Client calls /api/webauthn/generate-registration-options]
    B --> C[Genkit flow generates challenge]
    C --> D[Server sends challenge to client]
    D --> E[Client calls navigator.credentials.create()]
    E --> F{User approves with fingerprint/face ID}
    F --> G[Browser returns credential to client]
    G --> H[Client sends credential to /api/webauthn/verify-registration]
    H --> I[Genkit flow verifies the credential against the challenge]
    I --> J{Server saves the new public key}
    J --> K[Client shows success message]
```

### 5. Key Code Snippets
**Starting WebAuthn Registration (`profile-form.tsx`):**
```javascript
import { registerWebAuthn } from "@/lib/webauthn";

async function handleBiometricRegistration() {
  try {
    const success = await registerWebAuthn();
    if (success) {
      toast({ title: "Biometric Sign-in Enabled" });
    }
  } catch (error) {
    // ... handle error
  }
}
```

**Server-side Challenge Generation (`generate-registration-options-flow.ts`):**
```typescript
import { generateRegistrationOptions as generateOptions } from '@simplewebauthn/server';

// ... inside the flow
const options = await generateOptions({
  rpName: 'MediConnect',
  rpID: 'localhost', // From environment variable
  userID: user.id,
  userName: user.email,
});

// Store challenge in user's session
user.currentChallenge = options.challenge;
return options;
```

### 6. Testing Instructions
1.  **Registration and OTP**: Create a new account through the register form. Verify you are redirected to the `/otp-verify` page.
2.  **Login**: Log in with the credentials of a mock user (e.g., `dr.evelyn.reed@medconnect.com`). Verify you are redirected to the correct dashboard based on the selected role.
3.  **Enable Biometrics**: Navigate to the `/profile` page. Click "Enable Biometric Sign-in." Follow the browser prompt. Verify a success toast appears. (Note: This requires a device with a secure element, like a phone or a laptop with a fingerprint reader).
4.  **Login with Biometrics**: Log out. On the login page, click "Sign in with Biometrics." Verify you can log in without a password.
5.  **Voice Assistance**: On the forgot password page, click "Use Voice Assistance." Verify that audio plays, reading the instructions.
