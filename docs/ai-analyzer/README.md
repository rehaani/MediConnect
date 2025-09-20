# AI Symptom Analyzer

### 1. Introduction
The AI Symptom Analyzer is a core feature of MediConnect, providing users with a preliminary health assessment based on their self-described symptoms. It leverages a powerful Large Language Model (LLM) through Google's Genkit framework to analyze user input and provide a risk level, assessment, and recommendation.

### 2. Integration in MediConnect
The feature is powered by a Genkit flow and integrated into a multi-step React component.

- **Genkit Flow**: The backend logic is defined in `src/ai/flows/health-assessment-flow.ts`. It uses a structured prompt with Zod schemas (`src/ai/schemas/health-assessment.ts`) for input and output, ensuring reliable, structured data from the LLM.
- **Safety First**: The prompt engineering includes strict instructions for the LLM to prioritize safety, such as immediately classifying emergency symptoms and always advising users to consult a professional.
- **Frontend Component**: The user interface is the `HealthAssessor` component (`src/components/health-assessor/health-assessor.tsx`). It's a multi-step form that collects user information progressively (demographics, symptom description, image upload) to build a comprehensive input for the AI.
- **Image Analysis**: For visible symptoms, users can upload a photo. This triggers a separate Genkit flow, `process-symptom-image-flow.ts`, which uses a multimodal model to analyze the image and provide additional context.

### 3. Benefits
- **Accessibility**: Provides immediate, preliminary health information to users who may not have easy access to a doctor.
- **Structured Output**: Using Zod schemas with Genkit ensures the AI's response is predictable and can be easily parsed and displayed in the UI.
- **Triage Assistance**: Helps users understand the potential severity of their symptoms, guiding them to the appropriate level of care (e.g., monitor at home vs. seek emergency help).
- **Safety Guardrails**: The system is designed to be cautious and defer to medical professionals, reducing the risk of misdiagnosis.

### 4. Flowchart
```mermaid
flowchart TD
  A[User navigates to AI Health Assessor] --> B[HealthAssessor component mounts]
  B --> C{User fills multi-step form}
  C --> D[User provides symptoms & optional photo]
  D --> E{User clicks "Analyze Symptoms"}
  E --> F[Two parallel API calls initiated]
  F --> G[healthAssessment(textInput)]
  F --> H[processSymptomImage(imageInput)]
  G --> I[Genkit flow sends prompt to LLM]
  H --> J[Genkit flow sends image & prompt to LLM]
  I --> K[LLM returns structured text analysis]
  J --> L[LLM returns structured image analysis]
  K --> M{Component receives HealthAssessmentOutput}
  L --> N{Component receives ProcessSymptomImageOutput}
  M & N --> O[Component updates state with results]
  O --> P[UI displays risk level, recommendations, and image analysis]
```

### 5. Key Code Snippets
**Genkit Prompt Definition (`health-assessment-flow.ts`):**
```typescript
const prompt = ai.definePrompt({
  name: 'healthAssessmentPrompt',
  input: {schema: HealthAssessmentInputSchema},
  output: {schema: HealthAssessmentOutputSchema},
  prompt: `You are an AI medical assistant...
    **User Information:**
    - Symptoms: {{{symptoms}}}
    {{#if userContext}}
    - Age: {{userContext.age}}
    {{/if}}
    **Your Task:**
    1.  **Assess Risk:** Classify the risk as 'Low', 'Medium', 'High', or 'Emergency'.
    ...`,
});
```

**Calling the Flow from the Frontend (`HealthAssessor.tsx`):**
```javascript
// In onSubmit function
startTransition(async () => {
  const textInput: HealthAssessmentInput = { ... };
  const healthAssessmentResult = await healthAssessment(textInput);
  setTextResult(healthAssessmentResult);

  if (values.photo) {
    const imageAnalysisResult = await processSymptomImage({ ... });
    setImageResult(imageAnalysisResult);
  }
});
```

### 6. Testing Instructions
1.  **Emergency Symptom Test**: Enter symptoms indicative of a medical emergency, such as "severe chest pain and difficulty breathing." Verify that the AI result classifies the risk as "Emergency" and the primary recommendation is to contact local emergency services.
2.  **Low-Risk Symptom Test**: Enter mild symptoms like "sneezing and a runny nose." Verify the risk level is "Low" and the recommendation is to monitor at home.
3.  **Image Analysis Test**: Describe a "red, circular rash on my arm" and upload an image of a rash. Verify that the results include both the general health assessment and a separate analysis of the image.
4.  **Multi-Step Form Validation**: Attempt to proceed through the form without filling out required fields on each step. Verify that validation errors appear and prevent you from moving to the next step.
