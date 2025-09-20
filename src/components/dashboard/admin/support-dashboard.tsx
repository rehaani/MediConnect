
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { getTicketStore } from "@/lib/ticket-store";

type Status = "Open" | "In Progress" | "Closed";

export type Ticket = {
  id: string;
  userName: string;
  userEmail: string;
  issue: string;
  images: string[];
  status: Status;
  createdAt: string;
};

const getStatusVariant = (status: Status): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Open": return "destructive";
    case "In Progress": return "secondary";
    case "Closed": return "outline";
    default: return "default";
  }
};

export default function SupportDashboard() {
  const { toast } = useToast();
  const ticketStore = getTicketStore();
  const [data, setData] = React.useState<Ticket[]>(ticketStore.getTickets());
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }]);

  React.useEffect(() => {
    const handleUpdate = () => setData([...ticketStore.getTickets()]);
    ticketStore.subscribe(handleUpdate);
    return () => ticketStore.unsubscribe(handleUpdate);
  }, [ticketStore]);

  const handleStatusChange = (ticketId: string, status: Status) => {
    ticketStore.updateTicket(ticketId, { status });
    toast({
      title: "Ticket Status Updated",
      description: `Ticket #${ticketId.substring(0,6)} is now ${status}.`,
    });
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.userName}</div>
          <div className="text-sm text-muted-foreground">{row.original.userEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "issue",
      header: "Issue",
      cell: ({ row }) => <p className="max-w-xs truncate">{row.original.issue}</p>,
    },
    {
      accessorKey: "images",
      header: "Attachments",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.images.map((img, index) => (
            <div key={index} className="relative h-10 w-10">
              <Image src={img} alt={`Attachment ${index + 1}`} fill className="rounded-md object-cover" />
            </div>
          ))}
          {row.original.images.length === 0 && <span className="text-muted-foreground text-xs">None</span>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Created At</div>,
      cell: ({ row }) => <div className="text-right">{new Date(row.original.createdAt).toLocaleString()}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "Open")}>Mark as Open</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "In Progress")}>Mark as In Progress</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, "Closed")}>Mark as Closed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">User Support Tickets</CardTitle>
        <CardDescription>Review and manage open support requests from users.</CardDescription>
        <Input
            placeholder="Filter by user or issue..."
            value={(table.getColumn("issue")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("issue")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No open tickets.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
