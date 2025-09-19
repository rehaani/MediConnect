import { config } from 'dotenv';
config();

import '@/ai/flows/health-assessment-flow.ts';
import '@/ai/flows/find-doctor-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/process-symptom-image-flow.ts';
import '@/ai/flows/generate-registration-options-flow';
import '@/ai/flows/verify-registration-flow';
import '@/ai/flows/generate-authentication-options-flow';
import '@/ai/flows/verify-authentication-flow';
import '@/ai/flows/analyze-documents-flow';
