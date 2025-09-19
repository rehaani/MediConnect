'use server';
/**
 * @fileOverview An AI agent that analyzes uploaded medical documents.
 *
 * - analyzeDocuments - A function that handles the document analysis.
 * - AnalyzeDocumentsInput - The input type for the analyzeDocuments function.
 * - AnalyzeDocumentsOutput - The return type for the analyzeDocuments function.
 */

import {ai} from '@/ai/genkit';
import { AnalyzeDocumentsInput, AnalyzeDocumentsInputSchema, AnalyzeDocumentsOutput, AnalyzeDocumentsOutputSchema } from '@/ai/schemas/document-analyzer-schema';


export async function analyzeDocuments(input: AnalyzeDocumentsInput): Promise<AnalyzeDocumentsOutput> {
  return analyzeDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDocumentsPrompt',
  input: {schema: AnalyzeDocumentsInputSchema},
  output: {schema: AnalyzeDocumentsOutputSchema},
  prompt: `You are an expert medical AI assistant. Your task is to analyze the provided medical documents (which could be prescriptions, lab reports, etc.) and answer the user's query based on the information within them.

**Analysis Steps:**
1.  **Examine Documents:** Carefully review each uploaded document.
2.  **Address User Query:** Focus on extracting information that directly answers the user's query.
3.  **Summarize Findings:** Provide a clear, concise summary of the relevant information.
4.  **Detail Specifics:** List out the key data points, values, or notes as bullet points.
5.  **Provide Cautious Recommendation:** Based on the analysis, suggest a next step. Always emphasize that the user should consult with their healthcare provider and that this AI analysis is not a substitute for professional medical advice.

**User's Query:**
"{{{query}}}"

**Attached Documents:**
{{#each documents}}
- **{{name}}**:
{{media url=dataUri}}
---
{{/each}}
`,
});

const analyzeDocumentsFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentsFlow',
    inputSchema: AnalyzeDocumentsInputSchema,
    outputSchema: AnalyzeDocumentsOutputSchema,
  },
  async input => {
    // In a real app, you might add logic here to check document types,
    // count pages, or pre-process data before sending to the LLM.
    const {output} = await prompt(input);
    return output!;
  }
);
