
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Bot, Loader2, Mic, Send, Siren, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  HealthAssessmentInput,
  healthAssessment,
  HealthAssessmentOutput
} from "@/ai/flows/health-assessment-flow";
import { processSymptomImage, ProcessSymptomImageOutput } from "@/ai/flows/process-symptom-image-flow";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import Image from "next/image";
import { Label } from "../ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { Progress } from "../ui/progress";

const symptomsLibrary = [
  {
    category: "General",
    symptoms: ["Fever", "Fatigue", "Chills", "Night sweats", "Weight loss"],
  },
  {
    category: "Head & Neck",
    symptoms: ["Headache", "Dizziness", "Sore throat", "Runny nose", "Vision problems"],
  },
  {
    category: "Chest",
    symptoms: ["Cough", "Shortness of breath", "Chest pain", "Palpitations"],
  },
  {
    category: "Stomach",
    symptoms: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Abdominal pain"],
  },
];

const formSchema = z.object({
  age: z.coerce.number().min(1, { message: "Age is required." }).max(120),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], { required_error: "Please select a gender."}),
  medicalHistory: z.string().max(500, { message: "History must be 500 characters or less."}).optional(),
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }),
  photo: z.any().optional(),
  checkedSymptoms: z.array(z.string()).optional(),
  painLevel: z.number().min(0).max(10),
});

type FormData = z.infer<typeof formSchema>;

const stepFields: (keyof FormData)[][] = [
    ['age', 'gender', 'medicalHistory'], // Step 1
    ['symptoms', 'photo'], // Step 2
    ['checkedSymptoms'], // Step 3
    ['painLevel'], // Step 4
    [], // Step 5 (Review)
];

export default function HealthAssessor() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [textResult, setTextResult] = useState<HealthAssessmentOutput | null>(null);
  const [imageResult, setImageResult] = useState<ProcessSymptomImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 34,
      gender: "female",
      medicalHistory: "None",
      symptoms: "",
      photo: null,
      checkedSymptoms: [],
      painLevel: 2,
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

  const onSubmit = (values: FormData) => {
    setTextResult(null);
    setImageResult(null);
    setError(null);
    setCurrentStep(6); // Move to results view

    startTransition(async () => {
      try {
        const assessmentPromises = [];
        
        const combinedSymptoms = [
          values.symptoms,
          ...(values.checkedSymptoms && values.checkedSymptoms.length > 0 ? [`Checked symptoms: ${values.checkedSymptoms.join(', ')}`] : []),
          `Pain Level: ${values.painLevel}/10`
        ].join('\n');

        const textInput: HealthAssessmentInput = {
          symptoms: combinedSymptoms,
          userContext: {
            age: values.age,
            gender: values.gender as 'male' | 'female' | 'other',
            medicalHistory: values.medicalHistory,
          }
        };
        assessmentPromises.push(healthAssessment(textInput));

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

  const nextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const getRiskVariant = (riskLevel?: HealthAssessmentOutput['riskLevel']) => {
    if (!riskLevel) return 'default';
    if (riskLevel === 'Emergency' || riskLevel === 'High') return 'destructive';
    if (riskLevel === 'Medium') return 'default'; // Or could be 'warning' if we add it
    return 'default';
  };
  
  const getSliderColor = (value: number) => {
    if (value <= 3) return 'bg-green-500';
    if (value <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">AI Symptom Analyzer</CardTitle>
        <CardDescription>
            Step {currentStep} of {totalSteps}: {
                [
                    "General Information",
                    "Describe Your Symptoms",
                    "Symptom Checklist",
                    "Assess Severity",
                    "Review Your Information",
                    "Analysis Results"
                ][currentStep-1]
            }
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[400px]">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" {...form.register('age')} />
                    <FormMessage>{form.formState.errors.age?.message}</FormMessage>
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Controller
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                            </Select>
                        )}
                    />
                     <FormMessage>{form.formState.errors.gender?.message}</FormMessage>
                  </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Relevant Medical History (Optional)</Label>
                  <Textarea id="medicalHistory" placeholder="e.g., Asthma, high blood pressure, penicillin allergy..." {...form.register('medicalHistory')} rows={4} />
                   <FormMessage>{form.formState.errors.medicalHistory?.message}</FormMessage>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label>Describe your main symptoms</Label>
                    <Textarea
                        placeholder="e.g., I have a high fever, a persistent cough, and I'm feeling very tired."
                        {...form.register('symptoms')}
                        rows={6}
                    />
                    <FormMessage>{form.formState.errors.symptoms?.message}</FormMessage>
                </div>
                <Button variant="outline" className="w-full" type="button" onClick={handleVoiceInput}>
                  <Mic className="mr-2" /> Use Voice Assistance
                </Button>
                 <div>
                    <Label>(Optional) Upload a Photo</Label>
                    <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange} 
                    />
                    <p className="text-sm text-muted-foreground mt-1">A photo of a visible symptom (e.g., rash) can help the analysis.</p>
                </div>
                 {preview && (
                    <div className="space-y-2">
                        <Label>Photo Preview</Label>
                        <div className="relative w-40 h-40 border rounded-md">
                        <Image src={preview} alt="Symptom photo preview" fill objectFit="cover" className="rounded-md" />
                        </div>
                    </div>
                )}
              </div>
            )}
            {currentStep === 3 && (
                <div>
                    <Label>Check any additional symptoms you are experiencing</Label>
                    <Accordion type="multiple" className="w-full mt-2">
                        {symptomsLibrary.map(category => (
                            <AccordionItem value={category.category} key={category.category}>
                                <AccordionTrigger>{category.category}</AccordionTrigger>
                                <AccordionContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                     {category.symptoms.map(symptom => (
                                         <Controller
                                            key={symptom}
                                            control={form.control}
                                            name="checkedSymptoms"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={symptom}
                                                        checked={field.value?.includes(symptom)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), symptom])
                                                                : field.onChange(field.value?.filter(value => value !== symptom));
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={symptom}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {symptom}
                                                    </label>
                                                </div>
                                            )}
                                        />
                                     ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
             {currentStep === 4 && (
                <div className="space-y-4 pt-8">
                     <Controller
                        control={form.control}
                        name="painLevel"
                        render={({ field: { value, onChange } }) => (
                            <div>
                                <Label>On a scale of 0 to 10, how would you rate your overall discomfort or pain?</Label>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-lg font-bold">0</span>
                                    <Slider
                                        value={[value]}
                                        onValueChange={(vals) => onChange(vals[0])}
                                        max={10}
                                        step={1}
                                        className="[&>span>span]:h-5 [&>span>span]:w-5"
                                        trackClassName={getSliderColor(value)}
                                    />
                                    <span className="text-lg font-bold">10</span>
                                </div>
                                <div className="text-center text-2xl font-bold mt-4" style={{ color: getSliderColor(value).replace('bg-','').replace('-500','') }}>{value}</div>
                            </div>
                        )}
                    />
                </div>
             )}
             {currentStep === 5 && (
                <div className="space-y-4">
                    <h3 className="font-bold">Please review your information before submitting.</h3>
                    <div className="p-4 border rounded-lg space-y-3 bg-muted/50 text-sm">
                        <p><strong>Age:</strong> {form.getValues('age')}</p>
                        <p><strong>Gender:</strong> <span className="capitalize">{form.getValues('gender')}</span></p>
                        <p><strong>Medical History:</strong> {form.getValues('medicalHistory') || 'N/A'}</p>
                        <p><strong>Main Symptoms:</strong> {form.getValues('symptoms')}</p>
                        <p><strong>Additional Symptoms:</strong> {form.getValues('checkedSymptoms')?.join(', ') || 'None'}</p>
                        <p><strong>Pain Level:</strong> {form.getValues('painLevel')}/10</p>
                        {preview && (
                            <div className="flex items-start gap-2">
                                <strong>Photo Attached:</strong>
                                <Image src={preview} alt="Symptom photo" width={80} height={80} className="rounded-md border" />
                            </div>
                        )}
                    </div>
                </div>
             )}
             {currentStep === 6 && (
                <div className="space-y-4">
                    {isPending && (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">AI is analyzing your symptoms...</p>
                        </div>
                    )}
                    {!isPending && error && (
                         <Alert variant="destructive">
                            <Bot className="h-4 w-4" />
                            <AlertTitle className="font-headline">Analysis Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                     {!isPending && !error && textResult && textResult.riskLevel === 'Emergency' && (
                        <Alert variant="destructive">
                        <Siren className="h-4 w-4" />
                        <AlertTitle className="text-xl font-bold">MEDICAL EMERGENCY</AlertTitle>
                        <AlertDescription>
                            <p className="text-base mb-4">{textResult.recommendation}</p>
                        </AlertDescription>
                        </Alert>
                    )}
                    {!isPending && !error && textResult && textResult.riskLevel !== 'Emergency' && (
                        <Alert variant={getRiskVariant(textResult.riskLevel)}>
                            <Bot className="h-4 w-4" />
                            <AlertTitle className="font-headline">AI Health Assessment</AlertTitle>
                            <AlertDescription>
                                <p className="font-bold text-lg mb-2">Risk Level: {textResult.riskLevel}</p>
                                <div className="space-y-3">
                                    <p><strong className="font-semibold">Assessment:</strong> {textResult.assessment}</p>
                                    <p><strong className="font-semibold">Recommendation:</strong> {textResult.recommendation}</p>
                                    {textResult.specialistReferral && <p><strong className="font-semibold">Suggested Specialist:</strong> {textResult.specialistReferral}</p>}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                     {!isPending && !error && imageResult && (
                        <Alert>
                            <ImageIcon className="h-4 w-4" />
                            <AlertTitle className="font-headline">AI Image Analysis</AlertTitle>
                            <AlertDescription>
                                 <div className="space-y-3">
                                    <p><strong className="font-semibold">Analysis:</strong> {imageResult.analysis}</p>
                                    <p><strong className="font-semibold">Recommendation:</strong> {imageResult.recommendation}</p>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                     {!isPending && (textResult || imageResult) && (
                        <p className="text-xs text-destructive pt-4 font-semibold text-center">
                            Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                        </p>
                    )}
                </div>
             )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep > 1 && currentStep < 6 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft /> Back
              </Button>
            )}
             {currentStep < 5 && (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Next <ChevronRight />
              </Button>
            )}
            {currentStep === 5 && (
                <Button type="submit" disabled={isPending} className="ml-auto">
                    {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                    Analyze Symptoms
                </Button>
            )}
            {currentStep === 6 && (
                 <Button type="button" onClick={() => { form.reset(); setCurrentStep(1); setPreview(null); setTextResult(null); setImageResult(null); }} className="ml-auto">
                    Start Over
                </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
