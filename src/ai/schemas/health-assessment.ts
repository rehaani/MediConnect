/**
 * @fileOverview Schemas for the health assessment and symptom image processing flows.
 *
 * - HealthAssessmentInputSchema - The Zod schema for the input of the healthAssessment function.
 * - HealthAssessmentInput - The TypeScript type for the input of the healthAssessment function.
 * - HealthAssessmentOutputSchema - The Zod schema for the return type of the healthAssessment function.
 * - HealthAssessmentOutput - The TypeScript type for the return type of the healthAssessment function.
 * - ProcessSymptomImageInputSchema - The Zod schema for the input of the processSymptomImage function.
 * - ProcessSymptomImageInput - The TypeScript type for the input of the processSymptomImage function.
 * - ProcessSymptomImageOutputSchema - The Zod schema for the return type of the processSymptomImage function.
 * - ProcessSymptomImageOutput - The TypeScript type for the return type of the processSymptomImage function.
 */

import {z} from 'genkit';

// Schemas for Health Assessment
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


// Schemas for Symptom Image Processing
export const ProcessSymptomImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a physical symptom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The user\'s description of the symptom.'),
});
export type ProcessSymptomImageInput = z.infer<typeof ProcessSymptomImageInputSchema>;

export const ProcessSymptomImageOutputSchema = z.object({
  analysis: z.string().describe('A brief analysis of the visual symptom.'),
  recommendation: z.string().describe('A recommendation based on the visual analysis.'),
});
export type ProcessSymptomImageOutput = z.infer<typeof ProcessSymptomImageOutputSchema>;
