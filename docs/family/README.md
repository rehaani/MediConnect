# Family Management

### 1. Introduction
The Family Management feature allows a patient to grant designated family members access to their health information. This is crucial for caregivers, parents monitoring their children's health, or adults assisting their elderly parents. It provides a controlled, user-friendly way to share sensitive data with trusted individuals.

### 2. Integration in MediConnect
This is a self-contained, client-side feature that demonstrates the UI and state management for this functionality. The entire feature is encapsulated within a single component.

- **Frontend Component**: The `FamilyManagement` component (`src/components/family/family-management.tsx`) is the single source for this feature. It uses React's `useState` hook to manage an array of `FamilyMember` objects.
- **State Management**: All actions (adding or removing a family member) directly manipulate this local state array. In a production app, these actions would trigger API calls to a backend service (like Firestore) to update the user's document with a list of authorized family member IDs.
- **Add Member UI**: A `Dialog` component (from ShadCN UI) provides a modal form for adding a new family member. The form collects the person's name and their relationship to the patient.
- **Controlled Inputs**: The form uses a `Select` component to provide a predefined list of relationships (Spouse, Child, Parent, etc.), ensuring data consistency. The "Add Member" button in the dialog is disabled until both a name and a relationship are provided.
- **Display and Removal**: Added members are displayed in a list of cards, each showing the member's name, relationship, and a Picsum-generated avatar. Each card includes a "Remove" button (a trash icon) that allows the patient to revoke access at any time.
- **Member Limit**: The UI enforces a limit of 6 family members. Once the limit is reached, the "Add Member" button is disabled to prevent further additions.

### 3. Benefits
- **Controlled Access**: Empowers patients to decide exactly who can see their health data and to revoke that access instantly.
- **Improved Caregiving**: Makes it easier for caregivers to stay informed and assist with managing the patient's health journey by having access to their medical information (conceptually).
- **User-Friendly Interface**: The process of adding and removing members is simple and intuitive, handled through a clean modal and clear buttons.
- **Scalable Data Model**: The underlying data model (a simple array of objects) is straightforward and would be easy to implement in a NoSQL database like Firestore.

### 4. Flowchart
```mermaid
flowchart TD
  A[User navigates to the Family Management page] --> B{Component renders list of family members from state}
  B --> C{User clicks "Add Member" button}
  C --> D[Dialog opens with a form for name and relationship]
  D --> E{User fills form and clicks "Add Member" within the dialog}
  E --> F[New member object is added to the component's state array]
  F --> G[Dialog closes and the list of members re-renders to show the new addition]
  G --> B
  
  B --> H{User clicks the trash icon on a member's card}
  H --> I[Member is filtered out of the state array based on their name]
  I --> J[List re-renders without the removed member]
  J --> B
```

### 5. Key Code Snippets
**State Management and Add Handler (`FamilyManagement.tsx`):**
```javascript
const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
const [newMemberName, setNewMemberName] = useState("");
const [newMemberRelationship, setNewMemberRelationship] = useState("");

const handleAddMember = () => {
  if (newMemberName && newMemberRelationship && familyMembers.length < 6) {
    const newMember: FamilyMember = {
      name: newMemberName,
      relationship: newMemberRelationship,
      avatar: `https://picsum.photos/seed/${newMemberName}/100/100`, // Example avatar
      hint: "person portrait",
    };
    setFamilyMembers([...familyMembers, newMember]);
    // Reset form fields and close the dialog
    setNewMemberName("");
    setNewMemberRelationship("");
    setIsDialogOpen(false);
  }
};
```

**Remove Handler (`FamilyManagement.tsx`):**
```javascript
const handleRemoveMember = (name: string) => {
  // Filters the array to remove the member with the matching name
  setFamilyMembers(familyMembers.filter(member => member.name !== name));
};
```

### 6. Testing Instructions
1.  **Add a Member**: Click the "Add Member" button. In the dialog, fill in a name and select a relationship from the dropdown. Click "Add Member" to save. Verify the new member appears in the list with their details.
2.  **Input Validation**: Open the "Add Member" dialog. Verify that the final "Add Member" button is disabled. Enter a name but do not select a relationship; verify the button is still disabled. Select a relationship; verify the button becomes enabled.
3.  **Member Limit**: Add members until you have 6 in the list. Verify the main "Add Member" button on the page becomes disabled.
4.  **Remove a Member**: Click the trash icon next to any family member in the list. Verify that they are immediately removed from the list and the UI updates.
