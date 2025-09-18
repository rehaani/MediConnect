"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FamilyMember = {
  name: string;
  relationship: string;
  avatar: string;
  hint: string;
};

const initialFamilyMembers: FamilyMember[] = [
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRelationship, setNewMemberRelationship] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddMember = () => {
    if (newMemberName && newMemberRelationship && familyMembers.length < 6) {
      const newMember: FamilyMember = {
        name: newMemberName,
        relationship: newMemberRelationship,
        avatar: `https://picsum.photos/seed/${newMemberName.toLowerCase().replace(' ','')}/100/100`,
        hint: "person portrait",
      };
      setFamilyMembers([...familyMembers, newMember]);
      setNewMemberName("");
      setNewMemberRelationship("");
      setIsDialogOpen(false);
    }
  };

  const handleRemoveMember = (name: string) => {
    setFamilyMembers(familyMembers.filter(member => member.name !== name));
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Family Members</CardTitle>
                <CardDescription>
                Grant and manage access for your family members (up to 6).
                </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={familyMembers.length >= 6}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="relationship" className="text-right">
                      Relationship
                    </Label>
                    <Select onValueChange={setNewMemberRelationship} value={newMemberRelationship}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a relationship" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Partner">Partner</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Guardian">Legal Guardian</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddMember} disabled={!newMemberName || !newMemberRelationship}>Add Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.name)}>
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
