
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fingerprint, LogIn } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/lib/auth";
import { loginWithWebAuthn } from "@/lib/webauthn";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
  role: z.enum(["patient", "provider", "admin"]),
});

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "patient",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, you would handle authentication here.
    router.push(`/dashboard?role=${values.role}`);
  }

  async function handleBiometricAuth() {
    try {
        const success = await loginWithWebAuthn();
        if (success) {
            toast({
                title: "Biometric Sign-in Successful",
                description: "You are now signed in.",
            });
            // Redirect to the appropriate dashboard based on user role after successful sign-in
            // For this demo, we assume the biometric user is a provider.
            router.push('/dashboard?role=provider');
        } else {
             toast({
                variant: "destructive",
                title: "Biometric Sign-in Failed",
                description: "Could not verify your identity. Please try again or use your password.",
            });
        }
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Biometric Sign-in Error",
            description: errorMessage,
        });
    }
  }

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Welcome</CardTitle>
            <CardDescription>
              Sign in to your MediConnect account
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sign in as a...</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="provider">
                        Healthcare Provider
                      </SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right text-sm">
              <Link href="/forgot-password" passHref>
                <Button variant="link" className="p-0 h-auto">
                  Forgot password?
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              <LogIn />
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleBiometricAuth}
              type="button"
            >
              <Fingerprint />
              Sign in with Biometrics
            </Button>
            <CardDescription>
              Don&apos;t have an account?{" "}
              <Link href="/register" passHref>
                <Button variant="link" className="p-0 h-auto">
                  Sign up
                </Button>
              </Link>
            </CardDescription>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
