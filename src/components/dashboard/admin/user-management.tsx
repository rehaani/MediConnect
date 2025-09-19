
"use client";
import * as React from "react"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, UserPlus, Check, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/lib/auth";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: "verified" | "unverified" | "suspended";
};

const mockUsers: User[] = [
  { id: 'usr_1', name: 'Alex Doe', email: 'alex.doe@example.com', avatar: 'https://picsum.photos/seed/patient/40/40', role: 'patient', status: 'verified' },
  { id: 'usr_2', name: 'Dr. Evelyn Reed', email: 'dr.evelyn.reed@medconnect.com', avatar: 'https://picsum.photos/seed/provider/40/40', role: 'provider', status: 'verified' },
  { id: 'usr_3', name: 'Sam Chen', email: 's.chen.admin@medconnect.com', avatar: 'https://picsum.photos/seed/admin/40/40', role: 'admin', status: 'verified' },
  { id: 'usr_4', name: 'Priya Sharma', email: 'priya.sharma@new.com', avatar: 'https://picsum.photos/seed/newuser/40/40', role: 'patient', status: 'unverified' },
  { id: 'usr_5', name: 'Tom Brooks', email: 'tom.brooks@suspended.com', avatar: 'https://picsum.photos/seed/suspended/40/40', role: 'patient', status: 'suspended' },
  { id: 'usr_6', name: 'Dr. Ben Carter', email: 'ben.carter@med.org', avatar: 'https://picsum.photos/seed/newdoc/40/40', role: 'provider', status: 'unverified' },
];

const statusIcons = {
    verified: <ShieldCheck className="h-4 w-4 text-green-500" />,
    unverified: <ShieldAlert className="h-4 w-4 text-yellow-500" />,
    suspended: <Shield className="h-4 w-4 text-red-500" />,
};


export default function UserManagement() {
  const { toast } = useToast();
  const [data, setData] = React.useState<User[]>(mockUsers);
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const handleAction = (userId: string, action: string, value?: any) => {
    // In a real app, this would trigger a Cloud Function
    console.log(`Performing action: ${action} for user ${userId} with value ${value}`);
    toast({
        title: `Action: ${action}`,
        description: `Successfully performed ${action} for user ID ${userId}.`
    });
    if (action === 'changeRole') {
        setData(prev => prev.map(user => user.id === userId ? { ...user, role: value } : user));
    }
     if (action === 'verify') {
        setData(prev => prev.map(user => user.id === userId ? { ...user, status: 'verified' } : user));
    }
  };


  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const userInitials = user.name.split(' ').map(n => n[0]).join('');
        return (
             <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
            </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return <Badge variant={role === 'admin' ? 'destructive' : role === 'provider' ? 'secondary' : 'default'} className="capitalize">{role}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
          const status = row.getValue("status") as User['status'];
          return <div className="flex items-center gap-2 capitalize">
            {statusIcons[status]} {status}
          </div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => handleAction(user.id, 'verify')} disabled={user.status === 'verified'}>
                Verify User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction(user.id, 'changeRole', 'admin')} disabled={user.role === 'admin'}>
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction(user.id, 'changeRole', 'provider')} disabled={user.role === 'provider'}>
                Make Provider
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction(user.id, 'changeRole', 'patient')} disabled={user.role === 'patient'}>
                Make Patient
              </DropdownMenuItem>
               <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => handleAction(user.id, 'delete')}>Delete User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                 <CardTitle className="font-headline">All Users</CardTitle>
                 <CardDescription>An overview of all users on the platform.</CardDescription>
            </div>
             <div className="flex items-center gap-2 w-full md:w-auto">
                <Input
                placeholder="Filter by email or name..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                    table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
                />
                <Button>
                    <UserPlus className="mr-2"/> Add User
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} of{" "}
              {data.length} user(s).
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
