# Family Management

### 1. Introduction
The Family Management feature allows a patient to grant designated family members access to their health information. This is crucial for caregivers, parents monitoring their children's health, or adults assisting their elderly parents. It provides a controlled way to share sensitive data with trusted individuals.

### 2. Integration in MediConnect
This is a self-contained, client-side feature that demonstrates the UI and state management for this functionality.

- **Frontend Component**: The `FamilyManagement` component (`src/components/family/family-management.tsx`) is the single source for this feature. It uses React state to manage an array of `FamilyMember` objects.
- **Add Member UI**: A `Dialog` component provides a modal form for adding a new family member. The form collects the person's name and relationship to the patient. In a real app, this would likely involve an email or phone number to invite the user.
- **Relationship Control**: The form uses a `Select` component to provide a predefined list of relationships (Spouse, Child, Parent, etc.), ensuring data consistency.
- **Display and Removal**: Added members are displayed in a list of cards, each with a "Remove" button (trash icon) that allows the patient to revoke access at any time.

### 3. Benefits
- **Controlled Access**: Empowers patients to decide exactly who can see their health data.
- **Improved Caregiving**: Makes it easier for caregivers to stay informed and assist with managing the patient's health journey.
- **User-Friendly Interface**: The process of adding and removing members is simple and intuitive.
- **Scalable**: The underlying data model (a list of authorized user IDs) would be easy to implement in a Firestore backend.

### 4. Flowchart
```mermaid
flowchart TD
  A[User navigates to Family page] --> B{Component displays list of family members}
  B --> C{User clicks "Add Member"}
  C --> D[Dialog opens with form for name and relationship]
  D --> E{User fills form and clicks "Add Member"}
  E --> F[New member object is added to state array]
  F --> G[Dialog closes and list re-renders]
  G --> B
  B --> H{User clicks trash icon on a member}
  H --> I[Member is filtered out of state array]
  I --> J[List re-renders]
  J --> B
```

### 5. Key Code Snippets
**State and Add Handler (`FamilyManagement.tsx`):**
```javascript
const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);

const handleAddMember = () => {
  if (newMemberName && newMemberRelationship) {
    const newMember: FamilyMember = {
      name: newMemberName,
      relationship: newMemberRelationship,
      avatar: `https://picsum.photos/seed/${newMemberName}/100/100`,
      hint: "person portrait",
    };
    setFamilyMembers([...familyMembers, newMember]);
    // ... reset form and close dialog
  }
};
```

**Remove Handler (`FamilyManagement.tsx`):**
```javascript
const handleRemoveMember = (name: string) => {
  setFamilyMembers(familyMembers.filter(member => member.name !== name));
};
```

### 6. Testing Instructions
1.  **Add Member**: Click "Add Member," fill in a name and select a relationship, and save. Verify the new member appears in the list.
2.  **Max Limit**: Add members until you have 6. Verify the "Add Member" button becomes disabled.
3.  **Remove Member**: Click the trash icon next to a family member. Verify they are removed from the list.
4.  **Input Validation**: Open the "Add Member" dialog. Verify the final "Add Member" button is disabled until both a name is entered and a relationship is selected.
