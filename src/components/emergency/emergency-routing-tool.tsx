"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import {
  EmergencyRoutingDecisionInput,
  EmergencyRoutingDecisionOutput,
  emergencyRoutingDecision,
} from "@/ai/flows/emergency-routing-decision";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  context: z
    .string()
    .min(10, { message: "Please provide more details about the situation." }),
  userPermissions: z.enum(["always", "on-request", "never"]),
  locationDataAvailable: z.boolean(),
});

export default function EmergencyRoutingTool() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<EmergencyRoutingDecisionOutput | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: "User reports severe chest pain and difficulty breathing.",
      userPermissions: "on-request",
      locationDataAvailable: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    setError(null);
    startTransition(async () => {
      try {
        const input: EmergencyRoutingDecisionInput = values;
        const response = await emergencyRoutingDecision(input);
        setResult(response);
      } catch (e) {
        console.error(e);
        setError("An error occurred while processing the request.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Decision Factors</CardTitle>
              <CardDescription>
                Provide the following information for the AI to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., User is unconscious after a fall..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the emergency situation in detail.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPermissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Location Permissions</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user permission level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="always">Always Share</SelectItem>
                        <SelectItem value="on-request">
                          Share On Request
                        </SelectItem>
                        <SelectItem value="never">Never Share</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationDataAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Location Data Available</FormLabel>
                      <FormDescription>
                        Is GPS or network location data accessible?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Analyze Situation
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {result && (
        <Alert variant={result.shareLocation ? "default" : "destructive"}>
          <Bot className="h-4 w-4" />
          <AlertTitle className="font-headline">AI Decision</AlertTitle>
          <AlertDescription>
            <p className="font-bold text-lg mb-2">
              {result.shareLocation
                ? "Recommendation: Share Location"
                : "Recommendation: Do NOT Share Location"}
            </p>
            <p className="text-sm">
              <strong className="font-semibold">Reasoning:</strong> {result.reason}
            </p>
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
