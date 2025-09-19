
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video, MessageSquare, Hospital, User, Stethoscope, Loader2, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import type { FindDoctorInput, FindDoctorOutput } from "@/ai/flows/find-doctor-flow";
import { findDoctor } from "@/ai/flows/find-doctor-flow";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ConsultationMode = "video" | "chat" | "in-person";

export default function AppointmentScheduler() {
    const [mode, setMode] = useState<ConsultationMode>('video');
    const [symptoms, setSymptoms] = useState('');
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<FindDoctorOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFindSlots = () => {
        if (!symptoms) {
            setError("Please describe your symptoms before finding a doctor.");
            return;
        }
        setError(null);
        setResult(null);

        startTransition(async () => {
            const input: FindDoctorInput = {
                symptoms: symptoms,
                consultationMode: mode,
                 userContext: { // Mock user context
                    location: "Delhi, India",
                    languagePreference: "English",
                }
            };
            try {
                const response = await findDoctor(input);
                setResult(response);
            } catch (e) {
                console.error(e);
                setError("Sorry, we couldn't find any doctors at this time. Please try again later.");
            }
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Book a Consultation</CardTitle>
        <CardDescription>
          Our smart system will match you with the right doctor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <h3 className="font-semibold">1. Select Consultation Mode</h3>
            <RadioGroup value={mode} onValueChange={(value: ConsultationMode) => setMode(value)} className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                    <RadioGroupItem value="video" id="video" className="peer sr-only" />
                    <Label
                    htmlFor="video"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <Video className="mb-3 h-6 w-6" />
                        Video Call
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="chat" id="chat" className="peer sr-only" />
                    <Label
                    htmlFor="chat"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <MessageSquare className="mb-3 h-6 w-6" />
                        Chat
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="in-person" id="in-person" className="peer sr-only" />
                    <Label
                    htmlFor="in-person"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                        <Hospital className="mb-3 h-6 w-6" />
                        In-Person
                    </Label>
                </div>
            </RadioGroup>
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold">2. Describe Your Symptoms</h3>
            <Textarea 
                placeholder="e.g., I have a cough and a high fever..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
            />
        </div>

        <div className="space-y-4">
            <h3 className="font-semibold">3. Find a Doctor & Time</h3>
            <p className="text-sm text-muted-foreground">
                Based on your health profile and symptoms, we'll suggest the best specialists for you.
            </p>
            <Button onClick={handleFindSlots} disabled={isPending || !symptoms}>
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Calendar className="mr-2 h-4 w-4" />
                )}
                Find Available Slots
            </Button>
        </div>
        
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isPending && (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Finding the right doctor for you...</p>
            </div>
        )}

        {result && result.doctors && (
            <div className="space-y-4">
                <h3 className="font-semibold">4. Choose a Doctor</h3>
                 <div className="grid gap-4 md:grid-cols-2">
                    {result.doctors.map((doctor, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-headline text-lg">
                                    <User /> {doctor.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-1">
                                    <Stethoscope size={16} /> {doctor.specialty}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <p className="text-sm text-muted-foreground">{doctor.reason}</p>
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                    <Clock size={16} />
                                    <span>Next Available: {doctor.nextAvailable}</span>
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0">
                                <Button className="w-full">Book Now</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {result && result.doctors.length === 0 && !isPending && (
            <div className="p-4 border-dashed border-2 border-muted-foreground rounded-lg text-center">
                <p className="text-muted-foreground">No doctors found matching your criteria. Please try again or contact support.</p>
            </div>
        )}

      </CardContent>
    </Card>
  );
}
