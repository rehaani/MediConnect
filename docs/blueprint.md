# **App Name**: MediConnect Auth

## Core Features:

- Multi-Role User Registration: Allow registration for patients, healthcare providers, and admins.
- OTP Verification: Implement phone number OTP verification with email/password fallback.
- Role-Based Access Control: Restrict data access based on user roles. Enforce access control at the UI level, based on the detected role.
- Emergency Routing Tool: Use an LLM to evaluate whether location services for emergency routing can and should be used, based on the context and user permissions. The LLM acts as a tool which decides how to utilize location information effectively in emergencies, determining when to suppress the information if it shouldn't be exposed.
- Profile Completion Flow: Enable progressive profile building over multiple sessions.
- Password Reset Assistance: Guide password reset flow with voice prompts for low-literacy users.
- Biometric Authentication: Offer biometric authentication options for sensitive actions, falling back to the basic flow when biometrics aren't possible or not set up by the user.

## Style Guidelines:

- Light Mode - Primary Brand #355e3b, Secondary Brand #8a9a5b, Primary CTA/Success #9dc189, Background/Subtle Fill #c1e1c1, Main Text #333333, Muted Text #666666, Error/Alert #ff6b6b.
- Dark Mode - Background #1a2e2a, Surface/Cards #253b32, Primary Accent #9dc189, Secondary Accent #8a9a5b, Text & Icons #f5f5f5, Muted Text #c1c1c1.
- Montserrat for headings, Roboto Slab for buttons, Nunito for body text.
- Ensure WCAG 2.1 AA accessibility compliance, automatic dark/light mode switching, and semantic healthcare color usage across all Firebase components with consistent medical professional appearance.