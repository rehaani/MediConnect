'use server';
/**
 * @fileOverview A flow to generate WebAuthn registration options.
 *
 * - generateRegistrationOptions - Generates challenges for a new credential.
 * - GenerateRegistrationOptionsOutput - The return type for the flow.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {generateRegistrationOptions as generateOptions} from '@simplewebauthn/server';
import type {PublicKeyCredentialCreationOptionsJSON} from '@simplewebauthn/types';
import {findUser, getCredentialsForUser} from '@/lib/db';

// We do not define an input schema because this flow is for the current user.
// In a real app, you would get the user from the session.

const rpName = process.env.RP_NAME || 'MediConnect';
const rpID = process.env.RP_ID || 'localhost';

export const GenerateRegistrationOptionsOutputSchema =
  z.custom<PublicKeyCredentialCreationOptionsJSON>();
export type GenerateRegistrationOptionsOutput = z.infer<
  typeof GenerateRegistrationOptionsOutputSchema
>;

export async function generateRegistrationOptions(): Promise<GenerateRegistrationOptionsOutput> {
  return generateRegistrationOptionsFlow();
}

const generateRegistrationOptionsFlow = ai.defineFlow(
  {
    name: 'generateRegistrationOptionsFlow',
    outputSchema: GenerateRegistrationOptionsOutputSchema,
  },
  async () => {
    // In a real app, you would get the user from the session.
    const user = findUser('dr.evelyn.reed@medconnect.com');
    if (!user) {
      throw new Error('User not found.');
    }

    const userCredentials = getCredentialsForUser(user.id);

    const options = await generateOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      // Don't show credentials that are already registered
      excludeCredentials: userCredentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: cred.transports,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    // In a real app, you would store the challenge in the user's session
    user.currentChallenge = options.challenge;

    return options;
  }
);
