
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition, useRef } from "react";
import { Bot, Loader2, Mic, Send, Siren, Paperclip, Image as ImageIcon } from "lucide-react";
import {
  HealthAssessmentInput,
  HealthAssessmentOutput,
  healthAssessment,
} from "@/ai/flows/health-assessment-flow";
import { processSymptomImage, ProcessSymptomImageOutput } from "@/ai/flows/process-symptom-image-flow";


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
import { Input } from "../ui/input";
import Image from "next/image";

const formSchema = z.object({
  symptoms: z
    .string()
    .min(10, { message: "Please describe your symptoms in more detail." }),
  photo: z.any().optional(),
});

export default function HealthAssessor() {
  const [isPending, startTransition] = useTransition();
  const [textResult, setTextResult] = useState<HealthAssessmentOutput | null>(null);
  const [imageResult, setImageResult] = useState<ProcessSymptomImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: "",
      photo: null,
    },
  });
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        form.setValue("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    setTextResult(null);
    setImageResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const assessmentPromises = [];
        
        // Text-based assessment
        const textInput: HealthAssessmentInput = {
            symptoms: values.symptoms,
            userContext: { // In a real app, this would come from the user's profile
                age: 34,
                gender: "female",
                medicalHistory: "None"
            }
        };
        assessmentPromises.push(healthAssessment(textInput));

        // Image-based assessment (if a photo is provided)
        if (values.photo) {
            assessmentPromises.push(processSymptomImage({
                photoDataUri: values.photo,
                description: values.symptoms,
            }));
        }

        const results = await Promise.all(assessmentPromises);
        
        const healthAssessmentResult = results.find(r => 'riskLevel' in r) as HealthAssessmentOutput | undefined;
        const imageAnalysisResult = results.find(r => 'analysis' in r) as ProcessSymptomImageOutput | undefined;

        if (healthAssessmentResult) setTextResult(healthAssessmentResult);
        if (imageAnalysisResult) setImageResult(imageAnalysisResult);

      } catch (e) {
        console.error(e);
        setError("An error occurred while processing your request. The AI model may be busy or the input could not be processed. Please try again.");
      }
    });
  }

  const handleVoiceInput = () => {
    toast({
        title: "Voice Input Coming Soon",
        description: "This feature will allow you to describe your symptoms using your voice.",
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
                Describe your symptoms clearly for the AI to analyze. You can also upload a photo (e.g., of a rash).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Describe your symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a high fever, a persistent cough, and I'm feeling very tired. I also noticed a circular red rash on my arm."
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

              <div className="space-y-2">
                <Button variant="outline" className="w-full" type="button" onClick={handleVoiceInput}>
                  <Mic className="mr-2" /> Use Voice Assistance
                </Button>
                 <p className="text-xs text-center text-muted-foreground">Supports English, Hindi, and Punjabi (coming soon).</p>
              </div>

               <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>2. (Optional) Upload a Photo</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoChange} 
                            />
                        </FormControl>
                        <FormDescription>
                            If you have a visible symptom like a rash or swelling, a photo can help the AI analysis.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />

                {preview && (
                <div className="space-y-2">
                    <Label>Photo Preview</Label>
                    <div className="relative w-40 h-40 border rounded-md">
                    <Image src={preview} alt="Symptom photo preview" fill objectFit="cover" className="rounded-md" />
                    </div>
                </div>
                )}


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

      {isPending && (
         <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">AI is analyzing your symptoms...</p>
            <p className="text-xs text-muted-foreground mt-2">(This may take a moment)</p>
        </div>
      )}

      <div className="space-y-4">
        {textResult && textResult.riskLevel === 'Emergency' && (
            <Alert variant="destructive">
            <Siren className="h-4 w-4" />
            <AlertTitle className="text-xl font-bold">MEDICAL EMERGENCY</AlertTitle>
            <AlertDescription>
                <p className="text-base mb-4">{textResult.recommendation}</p>
                <div className="space-y-2 text-base">
                    <p><strong className="font-semibold">Assessment:</strong> {textResult.assessment}</p>
                </div>
                <p className="text-xs text-destructive pt-4 font-semibold">
                    Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
            </AlertDescription>
            </Alert>
        )}

        {textResult && textResult.riskLevel !== 'Emergency' && (
            <Alert variant={getRiskVariant(textResult.riskLevel)}>
            <Bot className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Health Assessment</AlertTitle>
            <AlertDescription>
                <p className="font-bold text-lg mb-2">
                    Risk Level: {textResult.riskLevel}
                </p>
                <div className="space-y-3">
                    <div>
                        <strong className="font-semibold">Assessment:</strong>
                        <p>{textResult.assessment}</p>
                    </div>
                    <div>
                        <strong className="font-semibold">Recommendation:</strong>
                        <p>{textResult.recommendation}</p>
                    </div>
                    {textResult.specialistReferral && (
                        <div>
                            <strong className="font-semibold">Suggested Specialist:</strong>
                            <p>{textResult.specialistReferral}</p>
                        </div>
                    )}
                </div>
            </AlertDescription>
            </Alert>
        )}

        {imageResult && (
            <Alert>
                <ImageIcon className="h-4 w-4" />
                <AlertTitle className="font-headline">AI Image Analysis</AlertTitle>
                <AlertDescription>
                     <div className="space-y-3">
                        <div>
                            <strong className="font-semibold">Analysis:</strong>
                            <p>{imageResult.analysis}</p>
                        </div>
                        <div>
                            <strong className="font-semibold">Recommendation:</strong>
                            <p>{imageResult.recommendation}</p>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        )}

        {(textResult || imageResult) && (
             <p className="text-xs text-destructive pt-4 font-semibold text-center">
                Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
        )}

        {error && (
            <Alert variant="destructive">
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-headline">Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>

    </div>
  );
}

    