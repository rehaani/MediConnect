# Support Ticketing

### 1. Introduction
The Support Ticketing system allows users to submit help requests and allows admins to manage and resolve these tickets. It's a crucial feature for user satisfaction and for identifying recurring issues within the platform.

### 2. Integration in MediConnect
The system consists of a user-facing submission form and an admin-facing management dashboard. The state is managed by a mock in-memory store, simulating a Firestore backend.

- **Ticket Store**: `src/lib/ticket-store.ts` contains an in-memory singleton store that mimics the behavior of a database. It holds an array of tickets and provides methods like `addTicket`, `getTickets`, and `updateTicket`. It also uses a listener pattern to notify components of updates.
- **Submission Form**: `src/components/support/support-ticket-form.tsx` is the UI for users to create a new ticket. It includes fields for describing the issue and an optional file uploader for screenshots. It uses React Hook Form for validation.
- **Admin Dashboard**: `src/components/dashboard/admin/support-dashboard.tsx` is the admin's view. It displays all tickets in a sortable, filterable table using `@tanstack/react-table`. Admins can view ticket details and change their status (Open, In Progress, Closed).
- **Real-time Updates**: Because the admin dashboard subscribes to the ticket store, it will update in real-time when a new ticket is submitted, just as it would with a Firestore listener.

### 3. Benefits
- **Centralized Management**: Provides admins with a single place to view and manage all user issues.
- **Rich Context**: Allowing users to upload images gives support staff valuable context for diagnosing problems.
- **Efficient Workflow**: The table-based interface allows admins to quickly sort, filter, and update tickets.
- **Reactive UI**: The pub/sub model of the store ensures the UI is always up-to-date.

### 4. Flowchart
```mermaid
flowchart TD
  subgraph "User Flow"
    A[User opens Support page] --> B[SupportTicketForm component renders]
    B --> C{User describes issue and attaches images}
    C --> D{User clicks "Submit Ticket"}
    D --> E[onSubmit handler calls ticketStore.addTicket()]
    E --> F[New ticket added to in-memory array]
    F --> G[Store notifies listeners]
    G --> H[UI shows success message]
  end

  subgraph "Admin Flow"
    I[Admin opens Support Dashboard] --> J[SupportDashboard component renders]
    J --> K[Component subscribes to ticketStore]
    K --> L[ticketStore.getTickets() populates table]
    G --> L
    M{Admin changes a ticket's status} --> N[Action handler calls ticketStore.updateTicket()]
    N --> O[Ticket is updated in array]
    O --> G
  end
```

### 5. Key Code Snippets
**In-memory Store (`ticket-store.ts`):**
```typescript
const createTicketStore = () => {
  let tickets: Ticket[] = [ ... ];
  let listeners: (() => void)[] = [];

  return {
    addTicket: (ticket: Ticket) => {
      tickets = [ticket, ...tickets];
      listeners.forEach(l => l());
    },
    getTickets: () => tickets,
    subscribe: (listener: () => void) => {
      listeners.push(listener);
    },
    // ... other methods
  };
};
```

**Admin Dashboard Subscription (`support-dashboard.tsx`):**
```javascript
const ticketStore = getTicketStore();
const [data, setData] = React.useState<Ticket[]>(ticketStore.getTickets());

React.useEffect(() => {
  const handleUpdate = () => setData([...ticketStore.getTickets()]);
  ticketStore.subscribe(handleUpdate);
  return () => ticketStore.unsubscribe(handleUpdate);
}, [ticketStore]);
```

### 6. Testing Instructions
1.  **Submit a Ticket**: As any user, navigate to `/support`. Fill out the form with an issue description and upload an image. Click "Submit." Verify the success message appears.
2.  **View Ticket in Admin**: Log in as an admin (or open a separate window) and navigate to the "Support Tickets" dashboard. Verify the newly created ticket appears at the top of the table.
3.  **Update Status**: In the admin dashboard, find the new ticket and use the action menu (...) to change its status to "In Progress." Verify the badge in the table updates.
4.  **Filter Tickets**: Use the filter input at the top of the admin table to search for your ticket by issue description. Verify the table filters to show only the matching ticket.
