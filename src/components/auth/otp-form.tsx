"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

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
  otp: z.string().min(6, { message: "Your OTP must be 6 digits." }).max(6),
});

export default function OtpForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // In a real app, you would verify the OTP here.
    toast({
        title: "Account Verified",
        description: "You have been successfully signed in.",
    })
    router.push("/dashboard");
  }
  
  const handleResendOtp = () => {
    toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone number.",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Phone Verification</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your phone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full">
              <KeyRound />
              Verify Account
            </Button>
            <CardDescription>
              Didn&apos;t receive a code?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={handleResendOtp} type="button">
                Resend OTP
              </Button>
            </CardDescription>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
