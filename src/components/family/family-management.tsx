"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2 } from "lucide-react";
import Image from "next/image";

const familyMembers = [
  {
    name: "John Reed",
    relationship: "Spouse",
    avatar: "https://picsum.photos/seed/spouse/100/100",
    hint: "man portrait"
  },
  {
    name: "Jane Reed",
    relationship: "Daughter",
    avatar: "https://picsum.photos/seed/daughter/100/100",
    hint: "girl portrait"
  },
];

export default function FamilyManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Family Members</CardTitle>
                <CardDescription>
                Grant and manage access for your family members.
                </CardDescription>
            </div>
            <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {familyMembers.map((member) => (
            <div
              key={member.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={member.avatar}
                  alt={member.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  data-ai-hint={member.hint}
                />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.relationship}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Remove member</span>
              </Button>
            </div>
          ))}
          {familyMembers.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
                No family members added yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
