import type { User } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CalendarDays, Bell, CheckCircle, Clock, AlertTriangle, Video, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

const patients = [
  { name: 'Ravi Kumar', reason: 'Follow-up', status: 'waiting', type: 'video', time: '10:00 AM', avatar: 'https://picsum.photos/seed/rk/40/40', hint: 'man portrait' },
  { name: 'Priya Sharma', reason: 'New patient consultation', status: 'waiting', type: 'video', time: '10:15 AM', avatar: 'https://picsum.photos/seed/ps/40/40', hint: 'woman portrait' },
  { name: 'Amit Singh', reason: 'Medication refill', status: 'in-progress', type: 'chat', time: '10:30 AM', avatar: 'https://picsum.photos/seed/as/40/40', hint: 'man glasses' },
  { name: 'Sunita Devi', reason: 'Lab results review', status: 'completed', type: 'video', time: '09:45 AM', avatar: 'https://picsum.photos/seed/sd/40/40', hint: 'senior woman' },
  { name: 'Vikram Rathore', reason: 'Urgent care - High fever', status: 'urgent', type: 'video', time: 'Now', avatar: 'https://picsum.photos/seed/vr/40/40', hint: 'man worried' },
];

const statusIcons = {
    waiting: <Clock className="h-4 w-4 text-blue-500" />,
    'in-progress': <Video className="h-4 w-4 text-green-500 animate-pulse" />,
    completed: <CheckCircle className="h-4 w-4 text-gray-500" />,
    urgent: <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />,
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'urgent': return 'destructive';
        case 'in-progress': return 'secondary';
        case 'completed': return 'outline';
        default: return 'default';
    }
}

const ProviderDashboard = ({ user }: { user: User }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Patient Queue</CardTitle>
                    <CardDescription>Manage your upcoming and active consultations.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map(patient => (
                                <TableRow key={patient.name}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={patient.avatar} alt={patient.name} data-ai-hint={patient.hint} />
                                                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{patient.name}</div>
                                                <div className="text-sm text-muted-foreground">{patient.time}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{patient.reason}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(patient.status)} className="capitalize flex items-center justify-center gap-1 w-28">
                                            {statusIcons[patient.status as keyof typeof statusIcons]}
                                            {patient.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" asChild>
                                          <Link href="/video-consultation">
                                            {patient.type === 'video' ? <Video className="mr-2"/> : <MessageSquare className="mr-2"/>}
                                            Start Call
                                          </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Today&apos;s Schedule
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">8 / 12</div>
                <p className="text-xs text-muted-foreground">
                    Appointments completed
                </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Pending Alerts
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                    Require immediate attention
                </p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Active Patients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-muted-foreground">
                    +10 from last month
                </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default ProviderDashboard;
