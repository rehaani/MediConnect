'use server';
/**
 * @fileOverview An AI agent that performs a health assessment based on user-provided symptoms.
 *
 * - healthAssessment - A function that handles the health assessment process.
 */

import {ai} from '@/ai/genkit';
import {
    HealthAssessmentInput,
    HealthAssessmentInputSchema,
    HealthAssessmentOutput,
    HealthAssessmentOutputSchema,
} from '@/ai/schemas/health-assessment';


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
