# Authentication

### 1. Introduction
Authentication is the foundation of MediConnect's security model. It provides secure, multi-role user registration and login. The system is designed to be flexible, offering standard email/password flows and a modern, phishing-resistant biometric (passkey) authentication option via WebAuthn. It also includes an accessibility feature to assist users with password resets.

### 2. Integration in MediConnect
Authentication is a mix of frontend components, API routes, and Genkit flows that work together to manage user identity.

- **UI Components**:
  - `LoginForm` (`/login`): Handles email/password and biometric sign-in. It includes logic to determine the user's role for correct dashboard redirection.
  - `RegisterForm` (`/register`): Manages multi-role user registration. Upon submission, it redirects to a mock OTP verification page.
  - `OtpForm` (`/otp-verify`): A placeholder page to simulate a phone number verification step.
  - `ForgotPasswordForm` (`/forgot-password`): A form for resetting passwords, which includes a text-to-speech accessibility feature.

- **Biometric/WebAuthn Authentication**:
  - This is powered by the `simplewebauthn` library for both client-side and server-side operations.
  - **Genkit Flows**: Four separate Genkit flows handle the server-side logic:
    - `generate-registration-options-flow.ts`: Creates a unique challenge for a new biometric credential.
    - `verify-registration-flow.ts`: Verifies the signed challenge from the browser and saves the new credential.
    - `generate-authentication-options-flow.ts`: Generates a challenge for an existing credential.
    - `verify-authentication-flow.ts`: Verifies the signed authentication assertion.
  - **API Routes**: The Genkit flows are exposed to the client via Next.js API routes in `/src/app/api/webauthn/...`.
  - **Client-side Helper**: The `webauthn.ts` library (`src/lib/webauthn.ts`) abstracts the browser's `navigator.credentials` API calls (`startRegistration`, `startAuthentication`), making it easy to trigger the WebAuthn process from components.
  - **Mock Database**: The `db.ts` file (`src/lib/db.ts`) serves as a mock in-memory database to store user challenges and registered credentials for the demo.

- **Accessibility (Text-to-Speech)**: The forgot password form includes a "Use Voice Assistance" button which calls a Genkit `textToSpeech` flow. This flow uses the Gemini TTS model to convert instructions to audio, which is then played back in the browser, improving accessibility for users with low literacy or visual impairments.

### 3. Benefits
- **Multi-Factor Potential**: The architecture supports combining password-based login with optional biometrics, providing robust security.
- **Passwordless Option**: WebAuthn allows for secure, passwordless logins, which are both more convenient and highly resistant to phishing attacks.
- **Enhanced Accessibility**: The text-to-speech feature on the password reset page is a key accessibility improvement.
- **Role-Based Access Control (RBAC)**: Registration and login include role selection, which is used to set custom claims on the user's auth token (conceptually) and redirect them to the appropriate dashboard.

### 4. Flowchart (WebAuthn Registration)
```mermaid
flowchart TD
    A[User clicks "Enable Biometric Sign-in" on Profile page] --> B[Client calls /api/webauthn/generate-registration-options with user's email]
    B --> C[Genkit flow generates cryptographic challenge]
    C --> D[Server sends challenge back to client]
    D --> E[Client calls navigator.credentials.create() with the challenge]
    E --> F{User approves with fingerprint, face ID, or security key}
    F --> G[Browser returns a signed credential to the client]
    G --> H[Client sends this credential to /api/webauthn/verify-registration]
    H --> I[Genkit flow verifies the credential against the stored challenge]
    I --> J{Server saves the new public key in the mock database}
    J --> K[Client shows success toast message]
```

### 5. Key Code Snippets
**Starting WebAuthn Registration (`profile-form.tsx`):**
```javascript
import { registerWebAuthn } from "@/lib/webauthn";

async function handleBiometricRegistration() {
  try {
    const email = form.getValues('email');
    const success = await registerWebAuthn(email);
    if (success) {
      toast({ title: "Biometric Sign-in Enabled" });
    }
  } catch (error) {
    // ... handle and display error
  }
}
```

**Server-side Challenge Generation (`generate-registration-options-flow.ts`):**
```typescript
import { generateRegistrationOptions as generateOptions } from '@simplewebauthn/server';
import { findUser } from '@/lib/db';

// ... inside the flow
const user = findUser(email);
// ...
const options = await generateOptions({
  rpName: 'MediConnect',
  rpID: 'localhost', // From environment variable
  userID: user.id,
  userName: user.email,
});

// Store challenge in the mock user's session
user.currentChallenge = options.challenge;
return options;
```

### 6. Testing Instructions
1.  **Registration and OTP**: Create a new account through the register form. Verify you are redirected to the mock `/otp-verify` page.
2.  **Login**: Log in with the credentials of a mock user (e.g., `dr.evelyn.reed@medconnect.com`, password can be anything). Select the 'provider' role and verify you are redirected to the provider dashboard.
3.  **Enable Biometrics**: Navigate to the `/profile` page. Click "Enable Biometric Sign-in." Follow the browser/OS prompt to create a passkey. Verify a success toast appears. (Note: This requires a device with a secure element, like a phone or a laptop with a fingerprint reader, or a browser that supports simulated authenticators in DevTools).
4.  **Login with Biometrics**: Log out. On the login page, enter the same user's email and click "Sign in with Biometrics." Verify you can log in without a password.
5.  **Voice Assistance**: Navigate to the forgot password page. Click "Use Voice Assistance." Verify that audio plays, reading the instructions aloud.
