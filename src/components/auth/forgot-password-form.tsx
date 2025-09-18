"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Mail, Mic, Send } from "lucide-react";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, you would send a password reset link here.
    toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, you will receive a reset link shortly.",
    })
    router.push("/");
  }

  const handleVoicePrompt = () => {
    toast({
      title: "Voice Prompts",
      description: "This feature would use text-to-speech to guide users through the password reset process. For example: 'Please enter the email address you used to sign up.'",
    });
  }

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button variant="outline" className="w-full" type="button" onClick={handleVoicePrompt}>
                <Mic />
                Use Voice Assistance
            </Button>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              <Send />
              Send Reset Link
            </Button>
            <CardDescription>
              Remember your password?{' '}
              <Link href="/" passHref>
                <Button variant="link" className="p-0 h-auto">Sign in</Button>
              </Link>
            </CardDescription>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
