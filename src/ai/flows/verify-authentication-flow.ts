'use server';
/**
 * @fileOverview A flow to verify a WebAuthn authentication response.
 *
 * - verifyAuthentication - Verifies the browser's response.
 * - VerifyAuthenticationInput - Input for the flow.
 * - VerifyAuthenticationOutput - Output for the flow.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {verifyAuthenticationResponse} from '@simplewebauthn/server';
import {
  findUser,
  getCredentialById,
  updateCredentialCounter,
} from '@/lib/db';
import type {
  VerifiedAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import type {AuthenticationResponseJSON} from '@simplewebauthn/types';

const rpID = process.env.RP_ID || 'localhost';

export const VerifyAuthenticationInputSchema = z.object({
  response: z.custom<AuthenticationResponseJSON>(),
  email: z.string().email(),
});
export type VerifyAuthenticationInput = z.infer<
  typeof VerifyAuthenticationInputSchema
>;

export const VerifyAuthenticationOutputSchema = z.object({
  verified: z.boolean(),
  // In a real app, you would return a session token or similar.
  customToken: z.string().optional(),
});
export type VerifyAuthenticationOutput = z.infer<
  typeof VerifyAuthenticationOutputSchema
>;

export async function verifyAuthentication(
  input: VerifyAuthenticationInput
): Promise<VerifyAuthenticationOutput> {
  return verifyAuthenticationFlow(input);
}

const verifyAuthenticationFlow = ai.defineFlow(
  {
    name: 'verifyAuthenticationFlow',
    inputSchema: VerifyAuthenticationInputSchema,
    outputSchema: VerifyAuthenticationOutputSchema,
  },
  async ({response, email}) => {
    // In a real app, you would get the user from the session.
    const user = findUser(email);
    if (!user) {
      throw new Error('User not found');
    }

    const expectedChallenge = user.currentChallenge;

    const credential = getCredentialById(response.id);

    if (!credential) {
      throw new Error('Credential not registered for this user.');
    }

    let verification: VerifiedAuthenticationResponse;
    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response,
        expectedChallenge: expectedChallenge || '',
        expectedOrigin: '*', // Allow any origin for this prototype
        expectedRPID: rpID,
        authenticator: credential,
        requireUserVerification: true,
      };
      verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
      console.error(error);
      return {verified: false};
    }

    const {verified, authenticationInfo} = verification;

    if (verified) {
      const {newCounter} = authenticationInfo;
      updateCredentialCounter(credential.credentialID, newCounter);
      // In a real app, you would generate a custom Firebase token here.
      // const customToken = await admin.auth().createCustomToken(user.id);
      return {verified: true, customToken: 'mock-custom-token'};
    }

    return {verified: false};
  }
);
