"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pill, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Medication = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  reason: string;
};

const initialMedications: Medication[] = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once a day",
    reason: "High Blood Pressure",
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice a day",
    reason: "Type 2 Diabetes",
  },
];

export default function MedicationManager() {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState("");
  const [newMedReason, setNewMedReason] = useState("");

  const handleAddMedication = () => {
    if (!newMedName || !newMedDosage || !newMedFrequency) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required medication details.",
      });
      return;
    }

    const newMedication: Medication = {
      id: Date.now(),
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFrequency,
      reason: newMedReason,
    };
    setMedications([...medications, newMedication]);
    
    // Reset form and close dialog
    setNewMedName("");
    setNewMedDosage("");
    setNewMedFrequency("");
    setNewMedReason("");
    setIsDialogOpen(false);
    toast({
        title: "Medication Added",
        description: `${newMedication.name} has been added to your list.`
    })
  };

  const handleRemoveMedication = (id: number) => {
    const medToRemove = medications.find(med => med.id === id);
    setMedications(medications.filter((med) => med.id !== id));
    if (medToRemove) {
      toast({
        title: "Medication Removed",
        description: `${medToRemove.name} has been removed.`
      })
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline">Digital Medicine Cabinet</CardTitle>
            <CardDescription>
              A list of your current medications.
            </CardDescription>
          </div>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add a New Medication</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="med-name" className="text-right">
                      Name*
                    </Label>
                    <Input id="med-name" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="col-span-3" placeholder="e.g., Paracetamol" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="med-dosage" className="text-right">
                      Dosage*
                    </Label>
                    <Input id="med-dosage" value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} className="col-span-3" placeholder="e.g., 500mg" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="med-frequency" className="text-right">
                      Frequency*
                    </Label>
                    <Input id="med-frequency" value={newMedFrequency} onChange={(e) => setNewMedFrequency(e.target.value)} className="col-span-3" placeholder="e.g., Twice a day" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="med-reason" className="text-right">
                      Reason
                    </Label>
                    <Input id="med-reason" value={newMedReason} onChange={(e) => setNewMedReason(e.target.value)} className="col-span-3" placeholder="e.g., For fever" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddMedication}>Save Medication</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Pill className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">{med.name} <span className="text-sm font-normal text-muted-foreground">({med.dosage})</span></p>
                  <p className="text-sm text-muted-foreground">
                    {med.frequency} - {med.reason}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveMedication(med.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Remove medication</span>
              </Button>
            </div>
          ))}
          {medications.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No medications added yet. Click "Add Medication" to start.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
