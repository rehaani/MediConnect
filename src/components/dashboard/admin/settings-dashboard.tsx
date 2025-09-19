
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const initialSymptomsLibrary = [
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

export default function SettingsDashboard() {
    const { toast } = useToast();
    const [symptomLibrary, setSymptomLibrary] = useState(initialSymptomsLibrary);
    const [newSymptom, setNewSymptom] = useState("");

    const handleAddSymptom = (category: string) => {
        if (!newSymptom) return;
        
        // In a real app, update Firestore
        setSymptomLibrary(currentLibrary => {
            return currentLibrary.map(cat => {
                if (cat.category === category) {
                    return { ...cat, symptoms: [...cat.symptoms, newSymptom] };
                }
                return cat;
            });
        });
        toast({ title: "Symptom Added", description: `Added "${newSymptom}" to ${category}.`});
        setNewSymptom("");
    };

    const handleRemoveSymptom = (category: string, symptom: string) => {
        // In a real app, update Firestore
         setSymptomLibrary(currentLibrary => {
            return currentLibrary.map(cat => {
                if (cat.category === category) {
                    return { ...cat, symptoms: cat.symptoms.filter(s => s !== symptom) };
                }
                return cat;
            });
        });
        toast({ title: "Symptom Removed", description: `Removed "${symptom}" from ${category}.`});
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Symptom Library Management</CardTitle>
                    <CardDescription>Add or remove symptoms from the health assessor checklist.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="multiple" className="w-full">
                        {symptomLibrary.map(({ category, symptoms }) => (
                            <AccordionItem value={category} key={category}>
                                <AccordionTrigger>{category}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Add new symptom..." 
                                                value={newSymptom} 
                                                onChange={(e) => setNewSymptom(e.target.value)}
                                            />
                                            <Button onClick={() => handleAddSymptom(category)}><PlusCircle className="mr-2"/> Add</Button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {symptoms.map(symptom => (
                                                <div key={symptom} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                                    <span>{symptom}</span>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently remove "{symptom}" from the {category} category. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleRemoveSymptom(category, symptom)}>Continue</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
