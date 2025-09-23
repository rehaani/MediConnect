'use server';
/**
 * @fileOverview A flow to verify a WebAuthn registration response.
 *
 * - verifyRegistration - Verifies the browser's response and saves the credential.
 * - VerifyRegistrationInput - Input for the flow.
 * - VerifyRegistrationOutput - Output for the flow.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {verifyRegistrationResponse} from '@simplewebauthn/server';
import type {
  VerifiedRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import {addCredential, findUser} from '@/lib/db';
import type {RegistrationResponseJSON} from '@simplewebauthn/types';

const rpID = process.env.RP_ID || 'localhost';
const origin = `https://${rpID}`;

export const VerifyRegistrationInputSchema = z.object({
  response: z.custom<RegistrationResponseJSON>(),
  email: z.string().email(),
});
export type VerifyRegistrationInput = z.infer<
  typeof VerifyRegistrationInputSchema
>;

export const VerifyRegistrationOutputSchema = z.object({
  verified: z.boolean(),
});
export type VerifyRegistrationOutput = z.infer<
  typeof VerifyRegistrationOutputSchema
>;

export async function verifyRegistration(
  input: VerifyRegistrationInput
): Promise<VerifyRegistrationOutput> {
  return verifyRegistrationFlow(input);
}

const verifyRegistrationFlow = ai.defineFlow(
  {
    name: 'verifyRegistrationFlow',
    inputSchema: VerifyRegistrationInputSchema,
    outputSchema: VerifyRegistrationOutputSchema,
  },
  async ({response, email}) => {
    // In a real app, you would get the user from the session.
    const user = findUser(email);

    if (!user) {
      throw new Error('User not found');
    }

    const expectedChallenge = user.currentChallenge;

    let verification: VerifiedRegistrationResponse;
    try {
      const opts: VerifyRegistrationResponseOpts = {
        response,
        expectedChallenge: expectedChallenge || '',
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: true,
      };
      verification = await verifyRegistrationResponse(opts);
    } catch (error) {
      console.error(error);
      return {verified: false};
    }

    const {verified, registrationInfo} = verification;

    if (verified && registrationInfo) {
      const {credentialPublicKey, credentialID, counter} = registrationInfo;

      addCredential(user.id, {
        credentialID,
        credentialPublicKey,
        counter,
        transports: response.response.transports || [],
      });
    }

    // In a real app, clear the challenge from the session.
    user.currentChallenge = undefined;

    return {verified};
  }
);
