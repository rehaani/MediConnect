import DocumentAnalyzer from "@/components/document-analyzer/document-analyzer";
import { getCurrentUser } from "@/lib/auth";

export default async function DocumentAnalyzerPage() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">AI Document Analyzer</h1>
          <p className="text-muted-foreground">
            Upload your medical documents like prescriptions or lab reports to get an AI-powered analysis.
             <strong className="block mt-2 font-bold text-destructive">This is not a substitute for professional medical advice. Always consult with your doctor.</strong>
          </p>
        </div>
        <DocumentAnalyzer user={user}/>
      </div>
    </div>
  );
}
