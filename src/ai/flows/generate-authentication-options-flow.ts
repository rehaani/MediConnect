'use server';
/**
 * @fileOverview A flow to generate WebAuthn authentication options.
 *
 * - generateAuthenticationOptions - Generates challenges for an existing credential.
 * - GenerateAuthenticationOptionsOutput - The return type for the flow.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  generateAuthenticationOptions as generateOptions,
} from '@simplewebauthn/server';
import {findUser, getCredentialsForUser} from '@/lib/db';
import type {PublicKeyCredentialRequestOptionsJSON} from '@simplewebauthn/types';

// We do not define an input schema because this flow is for the current user.
// In a real app, you would get the user from the session.
const rpID = process.env.RP_ID || 'localhost';

export const GenerateAuthenticationOptionsOutputSchema =
  z.custom<PublicKeyCredentialRequestOptionsJSON>();
export type GenerateAuthenticationOptionsOutput = z.infer<
  typeof GenerateAuthenticationOptionsOutputSchema
>;

export async function generateAuthenticationOptions(): Promise<GenerateAuthenticationOptionsOutput> {
  return generateAuthenticationOptionsFlow();
}

const generateAuthenticationOptionsFlow = ai.defineFlow(
  {
    name: 'generateAuthenticationOptionsFlow',
    outputSchema: GenerateAuthenticationOptionsOutputSchema,
  },
  async () => {
    // In a real app, you would get the user from the session.
    const user = findUser('dr.evelyn.reed@medconnect.com');
    if (!user) {
      throw new Error('User not found');
    }
    const userCredentials = getCredentialsForUser(user.id);

    const options = await generateOptions({
      rpID,
      allowCredentials: userCredentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification: 'preferred',
    });

    // In a real app, you would store the challenge in the user's session.
    user.currentChallenge = options.challenge;

    return options;
  }
);
