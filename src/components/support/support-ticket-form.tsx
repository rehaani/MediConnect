
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, User } from "@/lib/auth";
import { Loader2, Send, File as FileIcon, X, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { getTicketStore } from "@/lib/ticket-store";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const formSchema = z.object({
  issue: z.string().min(20, { message: "Please describe your issue in at least 20 characters." }).max(2000),
  images: z.array(z.instanceof(File)).max(MAX_FILES, `You can only upload a maximum of ${MAX_FILES} images.`).optional(),
});

type UploadedFile = {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

export default function SupportTicketForm() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      issue: "",
      images: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    
    // Basic validation
    const validationErrors = files.map(file => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: Invalid file type.`;
      if (file.size > MAX_FILE_SIZE) return `${file.name}: File is too large (max 5MB).`;
      return null;
    }).filter(Boolean);

    if (validationErrors.length > 0) {
      toast({ variant: "destructive", title: "File Error", description: validationErrors.join(" ") });
      return;
    }
    
    const combined = [...uploadedFiles, ...newFiles].slice(0, MAX_FILES);
    setUploadedFiles(combined);
    form.setValue('images', combined.map(uf => uf.file));
  };
  
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue('images', newFiles.map(uf => uf.file));
  };

  const simulateUpload = (file: UploadedFile, onComplete: () => void) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev =>
        prev.map(uf => {
          if (uf.file === file.file && uf.progress < 100) {
            const newProgress = Math.min(uf.progress + Math.random() * 25, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              onComplete();
            }
            return { ...uf, progress: newProgress };
          }
          return uf;
        })
      );
    }, 200);
  };
  
  const resetForm = () => {
    form.reset();
    setUploadedFiles([]);
    setIsSuccess(false);
    setIsSubmitting(false);
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    
    let uploadedCount = 0;
    const totalFiles = uploadedFiles.length;

    const onFileUploadComplete = () => {
      uploadedCount++;
      if (uploadedCount === totalFiles) {
        // This is where you would get the real download URLs
        const imagePreviews = uploadedFiles.map(uf => uf.preview);

        // Add to our mock ticket store
        const ticketStore = getTicketStore();
        ticketStore.addTicket({
            id: `ticket-${Date.now()}`,
            userName: user.name,
            userEmail: user.email,
            issue: values.issue,
            images: imagePreviews,
            status: "Open",
            createdAt: new Date().toISOString(),
        });

        setIsSuccess(true);
        toast({ title: "Support Ticket Submitted", description: "Our team will get back to you shortly." });
      }
    };
    
    if (totalFiles > 0) {
        uploadedFiles.forEach(file => simulateUpload(file, onFileUploadComplete));
    } else {
        // No files, just submit the ticket
        onFileUploadComplete();
    }
  };

  if (!user) {
    return <Card className="p-8 text-center"><Loader2 className="mx-auto animate-spin" /></Card>;
  }
  
  if (isSuccess) {
      return (
          <Card>
              <CardContent className="p-8 text-center flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-headline mb-2">Ticket Submitted Successfully!</h2>
                  <p className="text-muted-foreground mb-6">Our support team has received your request and will review it shortly. You will be notified via email.</p>
                  <Button onClick={resetForm}>Submit Another Ticket</Button>
              </CardContent>
          </Card>
      );
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">Submit a Support Ticket</CardTitle>
            <CardDescription>
              Describe your issue below. You can attach up to {MAX_FILES} screenshots.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your issue</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide as much detail as possible..."
                      rows={8}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attach Images</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isSubmitting || uploadedFiles.length >= MAX_FILES}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                    {uploadedFiles.map((uf, index) => (
                        <div key={index} className="border p-3 rounded-lg">
                            <div className="flex items-start gap-4">
                                <Image src={uf.preview} alt={uf.file.name} width={64} height={64} className="rounded-md object-cover w-16 h-16"/>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium truncate">{uf.file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(uf.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <Progress value={uf.progress} />
                                </div>
                                {!isSubmitting && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(index)}>
                                        <X className="h-4 w-4"/>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
