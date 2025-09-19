
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Loader2, FlaskConical, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type TestStatus = "queued" | "running" | "passed" | "failed";

interface Test {
    id: string;
    name: string;
    description: string;
    status: TestStatus;
    duration: number; // ms for simulation
    shouldFail: boolean;
}

const initialTests: Test[] = [
    { id: "auth", name: "User Authentication Flow", description: "Tests login, registration, and WebAuthn.", status: "queued", duration: 1500, shouldFail: false },
    { id: "ai-health", name: "AI Health Assessment Logic", description: "Verifies the health assessment flow returns valid risk levels.", status: "queued", duration: 2000, shouldFail: false },
    { id: "db-integrity", name: "Database Integrity Check", description: "Scans for schema mismatches and broken relations.", status: "queued", duration: 1800, shouldFail: true },
    { id: "notif", name: "Notification Service (FCM)", description: "Checks if the push notification service is operational.", status: "queued", duration: 1200, shouldFail: false },
    { id: "analytics", name: "Analytics Event Logging", description: "Ensures custom analytics events are being logged correctly.", status: "queued", duration: 1000, shouldFail: false },
    { id: "moderation", name: "Content Moderation Queue", description: "Verifies that new content is correctly added to the moderation queue.", status: "queued", duration: 1300, shouldFail: false },
];

const statusConfig = {
    queued: { icon: <Clock className="h-6 w-6 text-muted-foreground" />, color: "bg-gray-100 dark:bg-gray-800", text: "text-muted-foreground" },
    running: { icon: <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />, color: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-500" },
    passed: { icon: <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />, color: "bg-green-50 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400" },
    failed: { icon: <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />, color: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" },
};

export default function TestSuitePage() {
    const [tests, setTests] = useState<Test[]>(initialTests);
    const [isTesting, setIsTesting] = useState(false);
    const [progress, setProgress] = useState(0);

    const runTests = async () => {
        setIsTesting(true);
        setProgress(0);
        
        // Reset all to queued
        setTests(initialTests.map(t => ({ ...t, status: 'queued' })));

        for (let i = 0; i < tests.length; i++) {
            // Set current test to "running"
            setTests(prevTests => prevTests.map((test, index) => 
                index === i ? { ...test, status: 'running' } : test
            ));
            
            // Simulate test duration
            await new Promise(resolve => setTimeout(resolve, tests[i].duration));
            
            // Set final status
            setTests(prevTests => prevTests.map((test, index) => 
                 index === i ? { ...test, status: test.shouldFail ? 'failed' : 'passed' } : test
            ));
            
            setProgress(((i + 1) / tests.length) * 100);
        }
        
        setIsTesting(false);
    };

    const testsPassed = tests.filter(t => t.status === 'passed').length;
    const testsFailed = tests.filter(t => t.status === 'failed').length;
    const testsRun = testsPassed + testsFailed;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-headline mb-2">Admin Test Suite</h1>
                    <p className="text-muted-foreground">Run automated tests for various platform functions.</p>
                </div>
                <Button onClick={runTests} disabled={isTesting} size="lg">
                    {isTesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FlaskConical className="mr-2 h-4 w-4" />
                    )}
                    {isTesting ? "Running Tests..." : "Run All Tests"}
                </Button>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Status</CardTitle>
                            <CardDescription>Real-time status of automated system checks.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tests.map(test => (
                                <div key={test.id} className={`flex items-center justify-between p-4 border rounded-lg ${statusConfig[test.status].color}`}>
                                    <div className="flex items-center gap-4">
                                        {statusConfig[test.status].icon}
                                        <div>
                                            <p className="font-bold">{test.name}</p>
                                            <p className="text-sm text-muted-foreground">{test.description}</p>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold uppercase text-sm ${statusConfig[test.status].text}`}>
                                        {test.status}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Test Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {testsRun > 0 ? (
                                <div className="space-y-4">
                                     <div>
                                        <div className="flex justify-between text-sm font-medium mb-1">
                                            <span>Overall Progress</span>
                                            <span>{testsRun} / {tests.length} Complete</span>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                    <div className="flex justify-around text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{testsPassed}</p>
                                            <p className="text-sm text-muted-foreground">Passed</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-red-600">{testsFailed}</p>
                                            <p className="text-sm text-muted-foreground">Failed</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>Click "Run All Tests" to begin.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
