"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export default function ProfileProgress() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    // In a real app, you would fetch profile data and calculate completion.
    // For this demo, we'll simulate a gradual increase.
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
    </div>
  );
}
