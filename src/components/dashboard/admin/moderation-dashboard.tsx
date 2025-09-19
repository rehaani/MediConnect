
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockPendingAnalyses = [
    { id: 'ana_1', userId: 'usr_4', userName: 'Priya Sharma', content: 'Analysis of a prescription for Metformin...', status: 'pending' },
    { id: 'ana_2', userId: 'usr_5', userName: 'Tom Brooks', content: 'Blood test results show high cholesterol...', status: 'pending' },
];

const mockReportedMessages = [
    { id: 'msg_1', fromId: 'pat-1', fromName: 'Ravi Kumar', toId: 'pat-2', toName: 'Priya Sharma', content: 'This is an inappropriate message.', status: 'reported' },
];

export default function ModerationDashboard() {
    const { toast } = useToast();

    const handleAction = (itemId: string, action: 'approve' | 'reject') => {
        toast({
            title: `Action: ${action}`,
            description: `Item ${itemId} has been ${action}d.`
        });
        // In a real app, you would call a Cloud Function to update Firestore
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Moderation Queues</CardTitle>
                <CardDescription>Review content that requires administrative action.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="analyses">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="analyses">Pending Analyses</TabsTrigger>
                        <TabsTrigger value="messages">Reported Messages</TabsTrigger>
                    </TabsList>
                    <TabsContent value="analyses" className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Content Snippet</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPendingAnalyses.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.userName}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.content}</TableCell>
                                        <TableCell className="text-center"><Badge variant="outline">{item.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleAction(item.id, 'approve')}><Check className="text-green-500" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleAction(item.id, 'reject')}><X className="text-red-500" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="messages" className="mt-4">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>From</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockReportedMessages.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.fromName}</TableCell>
                                        <TableCell>{item.toName}</TableCell>
                                        <TableCell className="text-muted-foreground">{item.content}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Message Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>Suspend {item.fromName}</DropdownMenuItem>
                                                    <DropdownMenuItem>Warn {item.fromName}</DropdownMenuItem>
                                                    <DropdownMenuItem>Dismiss Report</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
