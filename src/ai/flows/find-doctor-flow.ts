'use server';
/**
 * @fileOverview An AI agent that recommends doctors based on patient symptoms and preferences.
 *
 * - findDoctor - A function that handles the doctor recommendation process.
 * - FindDoctorInput - The input type for the findDoctor function.
 * - FindDoctorOutput - The return type for the findDoctor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FindDoctorInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms.'),
  consultationMode: z.enum(['video', 'chat', 'in-person']).describe('The desired mode of consultation.'),
  userContext: z.object({
      location: z.string().optional().describe('The user\'s current location, relevant for in-person visits.'),
      languagePreference: z.string().optional().describe('The user\'s preferred language for consultation.'),
      previousDoctor: z.string().optional().describe('The name of a doctor the user has previously consulted.'),
    }).optional(),
});
export type FindDoctorInput = z.infer<typeof FindDoctorInputSchema>;

const DoctorSchema = z.object({
    name: z.string().describe('The full name of the recommended doctor.'),
    specialty: z.string().describe('The medical specialty of the doctor.'),
    reason: z.string().describe('A brief explanation for why this doctor is a good match.'),
    nextAvailable: z.string().describe('The next available time slot for the doctor, e.g., "Today at 4:00 PM".'),
});

export const FindDoctorOutputSchema = z.object({
    doctors: z.array(DoctorSchema).describe('A list of up to 3 recommended doctors.'),
});
export type FindDoctorOutput = z.infer<typeof FindDoctorOutputSchema>;

export async function findDoctor(input: FindDoctorInput): Promise<FindDoctorOutput> {
    return findDoctorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findDoctorPrompt',
  input: {schema: FindDoctorInputSchema},
  output: {schema: FindDoctorOutputSchema},
  prompt: `You are an intelligent medical appointment scheduler. Your task is to recommend up to 3 suitable doctors based on the user's symptoms and preferences.

**Analysis Steps:**
1.  **Analyze Symptoms:** Based on the symptoms, determine the most likely medical specialty required.
2.  **Consider Consultation Mode:** If the mode is 'in-person', prioritize doctors in the user's location. For 'video' or 'chat', location is less critical.
3.  **Factor in Preferences:** Consider language preference and any previous doctor interactions.
4.  **Generate Recommendations:** Provide a list of up to 3 doctors. For each doctor, provide their name, specialty, a brief reason for the recommendation, and a fictional next available time slot.

**User Information:**
- Symptoms: {{{symptoms}}}
- Consultation Mode: {{{consultationMode}}}
{{#if userContext}}
- Location: {{userContext.location}}
- Language Preference: {{userContext.languagePreference}}
- Previously Visited: {{userContext.previousDoctor}}
{{/if}}

Generate a list of fictional but realistic-sounding doctor recommendations in India.
`,
});

const findDoctorFlow = ai.defineFlow(
  {
    name: 'findDoctorFlow',
    inputSchema: FindDoctorInputSchema,
    outputSchema: FindDoctorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
