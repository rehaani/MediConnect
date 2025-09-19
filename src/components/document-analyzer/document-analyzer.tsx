"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Bot, Loader2, Send, File, X, FileImage, FileText, User, ChevronDown } from "lucide-react";
import {
  AnalyzeDocumentsInput,
  AnalyzeDocumentsOutput,
  analyzeDocuments,
} from "@/ai/flows/analyze-documents-flow";

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "../ui/input";
import type { User as UserType } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

// Mock data for patients, in a real app this would come from a database
const mockPatients = [
  { id: "pat-1", name: "Ravi Kumar" },
  { id: "pat-2", name: "Priya Sharma" },
  { id: "pat-3", name: "Amit Singh" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const formSchema = z.object({
  query: z
    .string()
    .min(10, { message: "Please enter a specific question about your documents." }),
  documents: z
    .array(z.any())
    .min(1, "Please upload at least one document.")
    .max(5, "You can upload a maximum of 5 documents."),
  patientId: z.string().optional(),
});

type UploadedFile = {
    name: string;
    size: number;
    type: string;
    dataUri: string;
}

export default function DocumentAnalyzer({ user }: { user: UserType }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AnalyzeDocumentsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useState<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "What is the dosage for the prescribed medication, and are there any warnings?",
      documents: [],
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    const validationErrors: string[] = [];

    Array.from(files).forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
            validationErrors.push(`${file.name} is too large (max 5MB).`);
            return;
        }
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            validationErrors.push(`${file.name} has an unsupported file type.`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            newFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                dataUri: e.target?.result as string,
            });

            // When last file is read, update state
            if (newFiles.length === files.length) {
                const combinedFiles = [...uploadedFiles, ...newFiles].slice(0, 5);
                setUploadedFiles(combinedFiles);
                form.setValue('documents', combinedFiles);
                if (combinedFiles.length > 5) {
                    setError("You can upload a maximum of 5 documents.");
                }
            }
        };
        reader.readAsDataURL(file);
    });

    if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
    }

    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue('documents', newFiles);
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    setError(null);

    startTransition(async () => {
      try {
        const input: AnalyzeDocumentsInput = {
            query: values.query,
            documents: uploadedFiles.map(f => ({ name: f.name, dataUri: f.dataUri })),
        };
        const response = await analyzeDocuments(input);
        setResult(response);
      } catch (e) {
        console.error(e);
        setError("An error occurred while analyzing your documents. The AI model may have been unable to process the request. Please try again.");
      }
    });
  }

  const FileIcon = ({ type }: { type: string }) => {
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5 text-muted-foreground" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-muted-foreground" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  }

  const isProvider = user.role === 'provider';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle className="font-headline">Document Analysis</CardTitle>
                  <CardDescription>
                    Upload up to 5 documents (images or PDFs, max 5MB each) and ask a specific question.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {isProvider && (
                    <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Select Patient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <User className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Select a patient to analyze documents for..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {mockPatients.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                
                {/* Only show upload for patients, or providers who have selected a patient */}
                {(user.role === 'patient' || (isProvider && form.watch('patientId'))) && (
                    <FormField
                    control={form.control}
                    name="documents"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Documents</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                multiple 
                                onChange={handleFileChange}
                                accept={ACCEPTED_FILE_TYPES.join(',')}
                                ref={fileInputRef}
                                disabled={isProvider && !form.watch('patientId')}
                            />
                        </FormControl>
                        <FormDescription>
                            Select one or more files to analyze.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                        <FormLabel>Uploaded Files</FormLabel>
                        <div className="grid gap-2">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileIcon type={file.type} />
                                        <span className="truncate text-sm">{file.name}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">({(file.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)} className="h-6 w-6">
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Question</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="e.g., What is the dosage for this medication? Are there any potential side effects mentioned?"
                            {...field}
                            rows={4}
                            disabled={isProvider && !form.watch('patientId')}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                </CardContent>
                <CardFooter>
                <Button type="submit" disabled={isPending || uploadedFiles.length === 0 || (isProvider && !form.watch('patientId'))} className="w-full md:w-auto">
                    {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Send className="mr-2 h-4 w-4" />
                    )}
                    Analyze Documents
                </Button>
                </CardFooter>
            </form>
            </Form>
        </Card>
        
        {isPending && (
            <div className="mt-6 flex flex-col items-center justify-center p-8 text-center bg-muted/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">AI is analyzing your documents...</p>
                <p className="text-xs text-muted-foreground mt-2">(This may take a moment, especially for PDFs)</p>
            </div>
        )}

        {result && (
            <Alert className="mt-6">
            <Bot className="h-4 w-4" />
            <AlertTitle className="font-headline">AI Document Analysis</AlertTitle>
            <AlertDescription>
                <div className="space-y-4">
                    <div>
                        <strong className="font-semibold block mb-1">Summary</strong>
                        <p>{result.summary}</p>
                    </div>
                    <div>
                        <strong className="font-semibold block mb-1">Details</strong>
                        <ul className="list-disc pl-5 space-y-1">
                            {result.details.map((detail, index) => (
                                <li key={index}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <strong className="font-semibold block mb-1">Recommendation</strong>
                        <p>{result.recommendation}</p>
                    </div>
                    <p className="text-xs text-destructive pt-4 font-semibold">
                        Disclaimer: This AI analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                </div>
            </AlertDescription>
            </Alert>
        )}

        {error && (
            <Alert variant="destructive" className="mt-6">
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-headline">Analysis Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>

      <div className="lg:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Analysis History</CardTitle>
                <CardDescription>Review your past document analyses.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Placeholder for history items */}
                    <div className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                        <div className="space-y-2">
                           <div className="h-4 w-32 bg-muted rounded"></div>
                           <div className="h-3 w-24 bg-muted rounded"></div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-lg animate-pulse opacity-70">
                        <div className="space-y-2">
                           <div className="h-4 w-32 bg-muted rounded"></div>
                           <div className="h-3 w-24 bg-muted rounded"></div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground pt-4">History feature coming soon.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
