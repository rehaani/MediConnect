'use server';
/**
 * @fileOverview An AI agent that analyzes a user-provided image of a symptom.
 *
 * - processSymptomImage - A function that handles the image analysis.
 * - ProcessSymptomImageInput - The input type for the processSymptomImage function.
 * - ProcessSymptomImageOutput - The return type for the processSymptomImage function.
 */

import {ai} from '@/ai/genkit';
import {
  ProcessSymptomImageInput,
  ProcessSymptomImageInputSchema,
  ProcessSymptomImageOutput,
  ProcessSymptomImageOutputSchema,
} from '@/ai/schemas/health-assessment';

export async function processSymptomImage(
  input: ProcessSymptomImageInput
): Promise<ProcessSymptomImageOutput> {
  return processSymptomImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processSymptomImagePrompt',
  input: {schema: ProcessSymptomImageInputSchema},
  output: {schema: ProcessSymptomImageOutputSchema},
  prompt: `You are a medical AI assistant. Analyze the following image of a user's symptom along with their description.

**Your Task:**
1.  **Analyze the Image:** Briefly describe what you see in the image in a clinical manner (e.g., "The image shows a circular, red rash with a raised border.").
2.  **Provide a Recommendation:** Based on the visual evidence and the user's description, suggest a cautious next step. Do not diagnose. Example: "Given the appearance of the rash, it would be advisable to have it examined by a dermatologist."

**IMPORTANT:** Always include a disclaimer that this analysis is not a substitute for a professional medical diagnosis.

**User's Description:** {{{description}}}
**Symptom Image:** {{media url=photoDataUri}}`,
});

const processSymptomImageFlow = ai.defineFlow(
  {
    name: 'processSymptomImageFlow',
    inputSchema: ProcessSymptomImageInputSchema,
    outputSchema: ProcessSymptomImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
