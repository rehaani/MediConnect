'use server';

/**
 * @fileOverview An AI agent that decides whether to share the user's location with emergency services.
 *
 * - emergencyRoutingDecision - A function that determines if location should be shared.
 * - EmergencyRoutingDecisionInput - The input type for the emergencyRoutingDecision function.
 * - EmergencyRoutingDecisionOutput - The return type for the emergencyRoutingDecision function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmergencyRoutingDecisionInputSchema = z.object({
  context: z.string().describe('The context of the emergency situation.'),
  userPermissions: z.string().describe('The user\u0027s location sharing permissions.'),
  locationDataAvailable: z.boolean().describe('Whether location data is currently available.'),
});

export type EmergencyRoutingDecisionInput = z.infer<
  typeof EmergencyRoutingDecisionInputSchema
>;

const EmergencyRoutingDecisionOutputSchema = z.object({
  shareLocation: z
    .boolean()
    .describe(
      'Whether the user\u0027s location should be shared with emergency services.'
    ),
  reason: z
    .string()
    .describe(
      'The reasoning behind the decision to share or not share the location.'
    ),
});

export type EmergencyRoutingDecisionOutput = z.infer<
  typeof EmergencyRoutingDecisionOutputSchema
>;

export async function emergencyRoutingDecision(
  input: EmergencyRoutingDecisionInput
): Promise<EmergencyRoutingDecisionOutput> {
  return emergencyRoutingDecisionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'emergencyRoutingDecisionPrompt',
  input: {schema: EmergencyRoutingDecisionInputSchema},
  output: {schema: EmergencyRoutingDecisionOutputSchema},
  prompt: `You are an AI assistant that helps determine whether a user's location should be shared with emergency services.

  Consider the following factors:
  - Context: {{{context}}}
  - User Permissions: {{{userPermissions}}}
  - Location Data Available: {{{locationDataAvailable}}}

  Based on these factors, decide whether the user's location should be shared.
  Explain your reasoning in the \"reason\" field.
  Set the \"shareLocation\" field to true if the location should be shared, and false otherwise.`,
});

const emergencyRoutingDecisionFlow = ai.defineFlow(
  {
    name: 'emergencyRoutingDecisionFlow',
    inputSchema: EmergencyRoutingDecisionInputSchema,
    outputSchema: EmergencyRoutingDecisionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
