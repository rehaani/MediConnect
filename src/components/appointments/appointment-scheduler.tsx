"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video, MessageSquare, Hospital } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function AppointmentScheduler() {

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
            <RadioGroup defaultValue="video" className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
            <h3 className="font-semibold">2. Find a Doctor & Time</h3>
            <p className="text-sm text-muted-foreground">
                Based on your health profile and symptoms, we'll suggest the best specialists for you.
            </p>
            <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Find Available Slots
            </Button>
        </div>
        
        <div className="p-4 border-dashed border-2 border-muted-foreground rounded-lg text-center">
            <p className="text-muted-foreground">Your appointment details will appear here once booked.</p>
        </div>
      </CardContent>
    </Card>
  );
}
