"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Save, Paperclip, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const symptomSchema = z.object({
  date: z.string().min(1, { message: "Date is required." }),
  symptoms: z.string().min(3, { message: "Please describe your symptoms." }),
  painLevel: z.coerce
    .number()
    .min(0, { message: "Pain level must be between 0 and 10." })
    .max(10, { message: "Pain level must be between 0 and 10." }),
  notes: z.string().optional(),
  photo: z.any().optional(),
});

export default function SymptomTracker() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof symptomSchema>>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      symptoms: "",
      painLevel: 5,
      notes: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        form.setValue("photo", file);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(values: z.infer<typeof symptomSchema>) {
    startTransition(() => {
      console.log(values);
      // Here you would typically save the data to your backend/database
      // and upload the photo to Firebase Storage.
      toast({
        title: "Symptom Logged",
        description: "Your symptoms for today have been saved.",
      });
      form.reset();
      setPreview(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Log Today&apos;s Symptoms</CardTitle>
        <CardDescription>
          Keep a record of how you are feeling. This can be shared with your
          doctor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Level (0-10)</FormLabel>
                    <FormControl>
                      <Input type="range" min="0" max="10" {...field} />
                    </FormControl>
                    <div className="text-center text-sm text-muted-foreground">
                      {field.value}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Headache, mild fever, sore throat"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Symptoms started after lunch."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attach Photo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        className="pl-12"
                        onChange={handlePhotoChange}
                      />
                      <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    You can attach a photo (e.g., a rash, a swollen joint).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {preview && (
              <div className="space-y-2">
                <Label>Photo Preview</Label>
                <div className="relative w-48 h-48 border rounded-md">
                   <Image src={preview} alt="Symptom photo preview" layout="fill" objectFit="cover" className="rounded-md" />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Log
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
