/**
 * @fileOverview Schemas for the health assessment flow.
 *
 * - HealthAssessmentInputSchema - The Zod schema for the input of the healthAssessment function.
 * - HealthAssessmentInput - The TypeScript type for the input of the healthAssessment function.
 * - HealthAssessmentOutputSchema - The Zod schema for the return type of the healthAssessment function.
 * - HealthAssessmentOutput - The TypeScript type for the return type of the healthAssessment function.
 */

import {z} from 'genkit';

export const HealthAssessmentInputSchema = z.object({
  symptoms: z.string().describe("A detailed description of the user's symptoms."),
  userContext: z
    .object({
      age: z.number().optional().describe("The user's age."),
      gender: z.enum(['male', 'female', 'other']).optional().describe("The user's gender."),
      medicalHistory: z
        .string()
        .optional()
        .describe(
          "The user's relevant medical history, including chronic conditions, allergies, and current medications."
        ),
    })
    .optional(),
});
export type HealthAssessmentInput = z.infer<typeof HealthAssessmentInputSchema>;

export const HealthAssessmentOutputSchema = z.object({
  riskLevel: z
    .enum(['Low', 'Medium', 'High', 'Emergency'])
    .describe('The assessed risk level based on the symptoms.'),
  assessment: z.string().describe("A summary of the AI's assessment of the symptoms."),
  recommendation: z
    .string()
    .describe(
      'Recommended next steps for the user. In case of emergency, this MUST start with "Contact local emergency services immediately."'
    ),
  specialistReferral: z
    .string()
    .optional()
    .describe('The type of medical specialist recommended for the user, if any.'),
});
export type HealthAssessmentOutput = z.infer<typeof HealthAssessmentOutputSchema>;
