"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save } from "lucide-react";

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
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  dob: z.string().min(1, { message: "Date of birth is required." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  address: z.string().min(5, { message: "Please enter a valid address." }),
  emergencyContact: z.string().min(1, { message: "Emergency contact is required." }),
  allergies: z.string().optional(),
});

export default function ProfileForm() {
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    // In a real app, you'd fetch and pre-fill this data.
    defaultValues: {
      fullName: "Dr. Evelyn Reed",
      dob: "1985-05-20",
      phone: "+1234567890",
      address: "123 Health St, Medville, MD 12345",
      emergencyContact: "John Reed (Spouse) - +10987654321",
      allergies: "None",
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully.",
    });
    console.log(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Personal Information</CardTitle>
        <CardDescription>
          Keep your details up to date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 555-555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, Anytown, USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe (Spouse) - 555-555-5555" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Allergies</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Penicillin, Peanuts" {...field} />
                    </FormControl>
                    <FormDescription>
                      List any allergies to medication, food, or other substances.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
