'use server';
/**
 * @fileOverview Schemas for the document analysis flow.
 *
 * - AnalyzeDocumentsInputSchema - The Zod schema for the input of the analyzeDocuments function.
 * - AnalyzeDocumentsInput - The TypeScript type for the input of the analyzeDocuments function.
 * - AnalyzeDocumentsOutputSchema - The Zod schema for the return type of the analyzeDocuments function.
 * - AnalyzeDocumentsOutput - The TypeScript type for the return type of the analyzeDocuments function.
 */

import {z} from 'genkit';

export const AnalyzeDocumentsInputSchema = z.object({
  documents: z.array(z.object({
    dataUri: z
      .string()
      .describe(
        "A document (image or PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
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
