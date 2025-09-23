
'use client';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

/**
 * Triggers the browser's WebAuthn registration process.
 */
export async function registerWebAuthn(email: string): Promise<boolean> {
  // 1. Get registration options from the server
  const options: PublicKeyCredentialCreationOptionsJSON = await fetch(
    '/api/webauthn/generate-registration-options',
     {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email }),
    }
  ).then(r => r.json());

  if (options.error) {
      throw new Error(options.error);
  }

  // 2. Start the registration process
  let attestation: RegistrationResponseJSON;
  try {
    attestation = await startRegistration(options);
  } catch (error) {
    console.error(error);
    // This happens if the user cancels the prompt
    throw new Error('Registration process was cancelled or failed.');
  }

  // 3. Send the attestation to the server for verification
  const verification: {verified: boolean; error?: string} = await fetch(
    '/api/webauthn/verify-registration',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ response: attestation, email }),
    }
  ).then(r => r.json());
  
  if (verification.error) {
    throw new Error(verification.error);
  }

  return verification.verified;
}

/**
 * Triggers the browser's WebAuthn authentication process.
 */
export async function loginWithWebAuthn(email: string): Promise<boolean> {
  // 1. Get authentication options from the server
  const options: PublicKeyCredentialRequestOptionsJSON = await fetch(
    '/api/webauthn/generate-authentication-options',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email }),
    }
  ).then(r => r.json());
  
  if (options.error) {
    throw new Error(options.error);
  }

  // 2. Start the authentication process
  let assertion: AuthenticationResponseJSON;
  try {
    assertion = await startAuthentication(options);
  } catch (error) {
    console.error(error);
     // This happens if the user cancels the prompt
    throw new Error('Authentication process was cancelled or failed.');
  }

  // 3. Send the assertion to the server for verification
  const verification: {verified: boolean; customToken?: string, error?: string} = await fetch(
    '/api/webauthn/verify-authentication',
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ response: assertion, email }),
    }
  ).then(r => r.json());

  if (verification.error) {
    throw new Error(verification.error);
  }


  if (verification.verified && verification.customToken) {
    // In a real app, you would sign in with the custom token
    // await signInWithCustomToken(getAuth(), verification.customToken);
    console.log("Simulating sign-in with custom token:", verification.customToken);
    return true;
  }

  return false;
}
