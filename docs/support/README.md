# Support Ticketing

### 1. Introduction
The Support Ticketing system is a crucial feature for user satisfaction and platform maintenance. It allows users to submit help requests (tickets) with descriptions and optional image attachments. On the other side, it provides administrators with a dashboard to manage, track, and resolve these tickets efficiently.

### 2. Integration in MediConnect
The system consists of a user-facing submission form and an admin-facing management dashboard. The state is managed by a mock in-memory store, which is designed to simulate a real-time database like Firestore.

- **Mock Ticket Store (`src/lib/ticket-store.ts`)**: This file contains a singleton, in-memory store that mimics the behavior of a real-time database. It holds an array of `Ticket` objects and provides methods like `addTicket`, `getTickets`, and `updateTicket`. Crucially, it uses a listener (pub/sub) pattern: when the store is updated (e.g., a new ticket is added), it notifies all subscribed components, causing them to re-render with the new data.
- **User Submission Form (`/support`)**: The `SupportTicketForm` component (`src/components/support/support-ticket-form.tsx`) is the UI for users to create a new ticket. It uses `react-hook-form` and `zod` for robust validation. It allows users to describe their issue and attach up to 5 images, with client-side validation for file size and type. When submitted, it adds the new ticket to the mock store.
- **Admin Management Dashboard (`/admin-dashboard/support`)**: The `SupportDashboard` component (`src/components/dashboard/admin/support-dashboard.tsx`) is the admin's view. It displays all tickets from the store in a sortable and filterable table built with `@tanstack/react-table`. Admins can:
    -   View all ticket details, including attached images.
    -   Filter tickets by searching for keywords in the issue description.
    -   Sort tickets by any column (e.g., by creation date).
    -   Change a ticket's status (Open, In Progress, Closed) via a dropdown menu in each row.
- **Real-time UI Updates**: Because the admin dashboard subscribes to the ticket store, it updates in real-time. If a user submits a new ticket while an admin is viewing the dashboard, the new ticket will instantly appear at the top of the table without requiring a page refresh, simulating the behavior of a Firestore `onSnapshot` listener.

### 3. Benefits
- **Centralized Management**: Provides administrators with a single, efficient interface to view and manage all user-reported issues.
- **Rich Context for Support**: Allowing users to upload images gives support staff valuable visual context for diagnosing problems, leading to faster resolution.
- **Efficient Admin Workflow**: The powerful table-based interface allows admins to quickly sort, filter, and update tickets, improving their productivity.
- **Reactive and Modern UI**: The pub/sub model of the mock store ensures the UI is always up-to-date, providing a seamless, real-time experience for administrators.

### 4. Flowchart
```mermaid
flowchart TD
  subgraph "User Flow"
    A[User navigates to /support page] --> B[SupportTicketForm component renders]
    B --> C{User describes issue and attaches screenshots}
    C --> D{User clicks "Submit Ticket"}
    D --> E[onSubmit handler calls ticketStore.addTicket()]
    E --> F[New ticket is prepended to the in-memory array]
    F --> G[Store notifies all subscribed listeners of the change]
    G --> H[UI shows a success message and form resets]
  end

  subgraph "Admin Flow"
    I[Admin opens /admin-dashboard/support] --> J[SupportDashboard component renders]
    J --> K[useEffect hook subscribes the component to the ticketStore]
    K --> L[ticketStore.getTickets() is called to populate the table]
    G --> L # This arrow shows the real-time update
    M{Admin changes a ticket's status via dropdown} --> N[Action handler calls ticketStore.updateTicket()]
    N --> O[Ticket is updated in the array]
    O --> G # The update triggers the notification to listeners
  end
```

### 5. Key Code Snippets
**In-memory Store with Listener Pattern (`ticket-store.ts`):**
```typescript
const createTicketStore = () => {
  let tickets: Ticket[] = [ /* initial mock data */ ];
  let listeners: (() => void)[] = [];

  return {
    addTicket: (ticket: Ticket) => {
      tickets = [ticket, ...tickets]; // Add new ticket to the top
      listeners.forEach(l => l()); // Notify all subscribers
    },
    getTickets: () => tickets,
    subscribe: (listener: () => void) => {
      listeners.push(listener);
    },
    unsubscribe: (listener: () => void) => {
      // ... logic to remove listener
    },
    // ... other methods like updateTicket
  };
};

// Singleton implementation
let store: ReturnType<typeof createTicketStore>;
export const getTicketStore = () => {
  if (!store) {
    store = createTicketStore();
  }
  return store;
};
```

**Admin Dashboard Subscription (`support-dashboard.tsx`):**
```javascript
const ticketStore = getTicketStore();
// Set initial state from the store
const [data, setData] = React.useState<Ticket[]>(ticketStore.getTickets());

React.useEffect(() => {
  // Define the handler to update state when the store changes
  const handleUpdate = () => setData([...ticketStore.getTickets()]);
  
  // Subscribe to the store on mount
  ticketStore.subscribe(handleUpdate);
  
  // Unsubscribe on unmount to prevent memory leaks
  return () => ticketStore.unsubscribe(handleUpdate);
}, [ticketStore]);
```

### 6. Testing Instructions
1.  **Submit a Ticket**: As any user, navigate to `/support`. Fill out the form with an issue description and upload an image. Click "Submit." After the simulated upload, verify the success screen appears.
2.  **View Ticket in Admin (Real-time)**: In a separate browser window or tab, log in as an admin and navigate to the "Support Tickets" dashboard (`/admin-dashboard/support`). Submit a new ticket from the user window. Verify the new ticket appears at the top of the admin table *without* you having to refresh the page.
3.  **Update Status**: In the admin dashboard, find the new ticket and use the action menu (...) to change its status to "In Progress." Verify the badge in the table updates instantly.
4.  **Filter Tickets**: Use the filter input at the top of the admin table to search for your ticket by its issue description. Verify the table correctly filters to show only the matching ticket.
