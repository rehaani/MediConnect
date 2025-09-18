"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Bot, Loader2, Mic, Send, Siren } from "lucide-react";
import {
  HealthAssessmentInput,
  HealthAssessmentOutput,
  healthAssessment,
} from "@/ai/flows/health-assessment-flow";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  symptoms: z
    .string()
    .min(10, { message: "Please describe your symptoms in more detail." }),
});

export default function HealthAssessor() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<HealthAssessmentOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "I have a severe headache, a fever of 102°F, and a stiff neck. The headache started this morning and has gotten progressively worse. Bright lights hurt my eyes.",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    setError(null);
    startTransition(async () => {
      try {
        // In a real app, you would get user context (age, gender, history) from their profile.
        const input: HealthAssessmentInput = {
            symptoms: values.symptoms,
            userContext: {
                age: 35,
                gender: "male",
                medicalHistory: "No chronic illnesses reported. Allergic to penicillin."
            }
        };
        const response = await healthAssessment(input);
        setResult(response);
      } catch (e) {
        console.error(e);
        setError("An error occurred while processing your request. Please try again.");
      }
    });
  }

  const handleVoiceInput = () => {
    toast({
        title: "Voice Input",
        description: "This feature is not yet implemented. It will allow you to describe your symptoms using your voice.",
    });
    };

  const getRiskVariant = (riskLevel?: HealthAssessmentOutput['riskLevel']) => {
    switch (riskLevel) {
        case 'Emergency':
        case 'High':
            return 'destructive';
        case 'Medium':
            return 'default';
        default:
            return 'default';
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Symptom Details</CardTitle>
              <CardDescription>
                Describe your symptoms clearly and in detail for the AI to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe your symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a sharp pain in my chest, and I feel dizzy..."
                        {...field}
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>
                      Include when the symptoms started, their severity, and any other relevant information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant="outline" className="w-full" type="button" onClick={handleVoiceInput}>
                <Mic />
                Use Voice Assistance
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Analyze Symptoms
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && (
        <Alert variant={getRiskVariant(result.riskLevel)}>
          {result.riskLevel === 'Emergency' ? <Siren className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          <AlertTitle className="font-headline">AI Health Assessment</AlertTitle>
          <AlertDescription>
            <p className="font-bold text-lg mb-2">
                Risk Level: {result.riskLevel}
            </p>
            <div className="space-y-3">
                <div>
                    <strong className="font-semibold">Assessment:</strong>
                    <p>{result.assessment}</p>
                </div>
                <div>
                    <strong className="font-semibold">Recommendation:</strong>
                    <p>{result.recommendation}</p>
                </div>
                {result.specialistReferral && (
                    <div>
                        <strong className="font-semibold">Suggested Specialist:</strong>
                        <p>{result.specialistReferral}</p>
                    </div>
                )}
                 <p className="text-xs text-muted-foreground pt-2">
                    Disclaimer: This AI assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
         <Alert variant="destructive">
            <Bot className="h-4 w-4" />
            <AlertTitle className="font-headline">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
