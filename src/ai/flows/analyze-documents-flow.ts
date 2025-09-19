'use server';
/**
 * @fileOverview An AI agent that analyzes uploaded medical documents.
 *
 * - analyzeDocuments - A function that handles the document analysis.
 * - AnalyzeDocumentsInput - The input type for the analyzeDocuments function.
 * - AnalyzeDocumentsOutput - The return type for the analyzeDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeDocumentsInputSchema = z.object({
  documents: z.array(z.object({
    dataUri: z
      .string()
      .describe(
        "A document (image or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    name: z.string().describe("The name of the file."),
  })).describe("An array of documents to be analyzed."),
  query: z.string().describe("The user's specific question or query about the documents."),
});
export type AnalyzeDocumentsInput = z.infer<typeof AnalyzeDocumentsInputSchema>;

export const AnalyzeDocumentsOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the key information found in the documents relevant to the user's query."),
  details: z.array(z.string()).describe("A bulleted list of specific details, findings, or answers extracted from the documents."),
  recommendation: z.string().describe("A suggested next step or recommendation for the user based on the analysis. This should be cautious and advise consulting a healthcare professional."),
});
export type AnalyzeDocumentsOutput = z.infer<typeof AnalyzeDocumentsOutputSchema>;

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
