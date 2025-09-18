'use server';
/**
 * @fileOverview An AI agent that performs a health assessment based on user-provided symptoms.
 *
 * - healthAssessment - A function that handles the health assessment process.
 * - HealthAssessmentInput - The input type for the healthAssessment function.
 * - HealthAssessmentOutput - The return type for the healthAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const HealthAssessmentInputSchema = z.object({
  symptoms: z.string().describe('A detailed description of the user\'s symptoms.'),
  userContext: z.object({
      age: z.number().optional().describe('The user\'s age.'),
      gender: z.enum(['male', 'female', 'other']).optional().describe('The user\'s gender.'),
      medicalHistory: z.string().optional().describe('The user\'s relevant medical history, including chronic conditions, allergies, and current medications.'),
    }).optional(),
});
export type HealthAssessmentInput = z.infer<typeof HealthAssessmentInputSchema>;

export const HealthAssessmentOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Emergency']).describe('The assessed risk level based on the symptoms.'),
  assessment: z.string().describe('A summary of the AI\'s assessment of the symptoms.'),
  recommendation: z.string().describe('Recommended next steps for the user. In case of emergency, this MUST start with "Contact local emergency services immediately."'),
  specialistReferral: z.string().optional().describe('The type of medical specialist recommended for the user, if any.'),
});
export type HealthAssessmentOutput = z.infer<typeof HealthAssessmentOutputSchema>;

export async function healthAssessment(input: HealthAssessmentInput): Promise<HealthAssessmentOutput> {
  return healthAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthAssessmentPrompt',
  input: {schema: HealthAssessmentInputSchema},
  output: {schema: HealthAssessmentOutputSchema},
  prompt: `You are an AI medical assistant designed to provide a preliminary health assessment. Your analysis must be cautious and prioritize user safety.

Analyze the provided symptoms and user context to determine a risk level, provide a brief assessment, and recommend next steps.

**IMPORTANT SAFETY GUIDELINES:**
- If there are any signs of a medical emergency (e.g., chest pain, difficulty breathing, stroke symptoms, severe bleeding, loss of consciousness), you MUST classify the risk as 'Emergency' and your primary recommendation MUST be to contact local emergency services immediately.
- Your recommendations should be based on established medical guidelines (e.g., WHO, ICMR).
- Always include a clear disclaimer that this is not a substitute for professional medical advice.

**User Information:**
- Symptoms: {{{symptoms}}}
{{#if userContext}}
- Age: {{userContext.age}}
- Gender: {{userContext.gender}}
- Medical History: {{userContext.medicalHistory}}
{{/if}}

**Your Task:**
1.  **Assess Risk:** Classify the risk as 'Low', 'Medium', 'High', or 'Emergency'.
2.  **Provide Assessment:** Briefly summarize the possible implications of the symptoms. Do not provide a definitive diagnosis.
3.  **Recommend Next Steps:** Suggest a course of action (e.g., monitor at home, schedule a doctor's appointment, go to an urgent care clinic, or seek immediate emergency help). If the risk is 'Emergency', the recommendation MUST start with "Contact local emergency services immediately."
4.  **Suggest Specialist (Optional):** If applicable, suggest a type of specialist to consult (e.g., Cardiologist, Neurologist, etc.).
`,
});

const healthAssessmentFlow = ai.defineFlow(
  {
    name: 'healthAssessmentFlow',
    inputSchema: HealthAssessmentInputSchema,
    outputSchema: HealthAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
