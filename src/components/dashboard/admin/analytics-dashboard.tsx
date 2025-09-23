
"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Download, Activity, Users, Clock, BarChart2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer,
} from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const userGrowthData = [
  { date: "Jan", users: 4000 },
  { date: "Feb", users: 3000 },
  { date: "Mar", users: 5000 },
  { date: "Apr", users: 4500 },
  { date: "May", users: 6000 },
  { date: "Jun", users: 7500 },
]
const userGrowthConfig: ChartConfig = {
    users: {
        label: "Users",
        color: "hsl(var(--primary))",
    }
}

const featureUsageData = [
  { name: "AI Analyzer", value: 400, fill: "var(--color-analyzer)" },
  { name: "Appointments", value: 300, fill: "var(--color-appointments)" },
  { name: "Symptom Tracker", value: 200, fill: "var(--color-tracker)" },
  { name: "Medications", value: 100, fill: "var(--color-meds)" },
]
const featureUsageConfig: ChartConfig = {
    analyzer: { label: "AI Analyzer", color: "hsl(var(--chart-1))" },
    appointments: { label: "Appointments", color: "hsl(var(--chart-2))" },
    tracker: { label: "Symptom Tracker", color: "hsl(var(--chart-3))" },
    meds: { label: "Medications", color: "hsl(var(--chart-4))" },
}


const recentActivities = [
  { id: 'log_1', admin: 'Sam Chen', action: 'Changed role for user usr_4 to patient', timestamp: '2023-10-27 10:00:00' },
  { id: 'log_2', admin: 'Sam Chen', action: 'Verified user usr_6', timestamp: '2023-10-27 09:45:00' },
  { id: 'log_3', admin: 'Sam Chen', action: 'Deleted user usr_5', timestamp: '2023-10-26 15:20:00' },
  { id: 'log_4', admin: 'System', action: 'High system load detected', timestamp: '2023-10-26 14:00:00' },
]


export default function AnalyticsDashboard() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const handleExport = (data: any[], fileName: string) => {
    // In a real app, use a library like papaparse
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold font-headline">Key Metrics</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1,254</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">8,432</div>
                <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Consultation Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12m 45s</div>
                <p className="text-xs text-muted-foreground">-2% from last week</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feature Engagement</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">AI Analyzer is most used</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">User Growth</CardTitle>
            <CardDescription>Total users over the selected date range.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ChartContainer config={userGrowthConfig} className="min-h-[200px] w-full">
              <LineChart accessibilityLayer data={userGrowthData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="users"
                  type="natural"
                  stroke="var(--color-users)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Feature Usage</CardTitle>
                <CardDescription>Distribution of key feature usage.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full flex items-center justify-center">
                 <ChartContainer config={featureUsageConfig} className="min-h-[200px] w-full">
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="name" hideLabel />}
                      />
                      <Pie data={featureUsageData} dataKey="value" nameKey="name" />
                      <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                  </ChartContainer>
            </CardContent>
        </Card>
      </div>
      
       <Card>
          <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="font-headline">Recent Audit Logs</CardTitle>
                    <CardDescription>A log of important administrative actions.</CardDescription>
                </div>
                <Button onClick={() => handleExport(recentActivities, 'audit-logs')}>
                    <Download className="mr-2"/>
                    Export CSV
                </Button>
            </div>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentActivities.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{log.admin}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell className="text-right">{log.timestamp}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
      </Card>
    </div>
  )
}

    
