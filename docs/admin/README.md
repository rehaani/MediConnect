# Admin Suite

### 1. Introduction
The Admin Suite is a collection of dashboards and tools designed for platform administrators to manage users, monitor analytics, moderate content, and resolve support issues. It is the central control panel for maintaining the health and integrity of the MediConnect platform, accessible only to users with the 'admin' role.

### 2. Feature Breakdown
The Admin Suite is a section of the application with several distinct pages, each represented by a React component. The data is currently mocked but simulates interaction with various backend services.

- **User Management (`/admin-dashboard/users`)**: A dashboard using `@tanstack/react-table` to display, filter, and sort all platform users. Admins can perform actions like changing a user's role (patient, provider, admin) or verifying their account. State is managed locally within the component.
- **Platform Analytics (`/admin-dashboard/analytics`)**: A mock dashboard using `recharts` to display key platform metrics like user growth and feature engagement. It simulates what an embedded Grafana or Superset dashboard would look like and includes a mock "Export CSV" functionality.
- **Content Moderation (`/admin-dashboard/moderation`)**: A queue-based interface for reviewing user-generated content that might require human oversight. The current implementation includes mock queues for "Pending Analyses" and "Reported Messages."
- **Support Ticketing (`/admin-dashboard/support`)**: The admin view for the support ticket system, which displays all user-submitted tickets in a filterable table. (See `docs/support/README.md` for more details on the ticket store).
- **System Test Suite (`/admin-dashboard/test-suite`)**: An interactive page that simulates running a suite of automated tests against platform services (e.g., Auth, AI, Database). It gives admins a quick, visual way to check system health, with one test intentionally designed to fail to demonstrate all states.

### 3. Benefits
- **Centralized Control**: Consolidates all administrative functions into one secure, role-protected area.
- **Data-Driven Insights**: The analytics dashboard provides a clear, visual representation of platform performance metrics.
- **Efficient Workflows**: Tools like the user management table and moderation queues are designed for efficient administrative work.
- **Proactive Maintenance**: The test suite allows admins to proactively check for system issues with a single click.

### 4. Flowchart (User Management)
```mermaid
flowchart TD
  A[Admin logs in] --> B[Redirect to /admin-dashboard]
  B --> C{Admin Dashboard displays feature cards}
  C -->|Clicks "User Management"| D[UserManagement component at /admin-dashboard/users]
  D --> E[Table displays mock user data]
  E --> F{Admin uses filter to find a user}
  F --> G{Admin opens action menu for a user}
  G --> H[Selects "Make Provider"]
  H --> I[Action handler updates local state]
  I --> J[Table re-renders with updated role badge]
```

### 5. Key Code Snippets
**User Management Table Definition (`user-management.tsx`):**
```typescript
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "User", ... },
  { accessorKey: "role", header: "Role", cell: ({ row }) => <Badge>...</Badge> },
  {
    id: "actions",
    cell: ({ row }) => {
      // ... DropdownMenu with actions like "Make Admin", "Delete User"
      // Actions call a handler that updates the local component state.
    }
  }
];

const table = useReactTable({ data, columns, ... });
```

**Test Suite Simulation (`test-suite/page.tsx`):**
```javascript
const runTests = async () => {
  setIsTesting(true);
  for (let i = 0; i < tests.length; i++) {
    // Set current test to "running"
    setTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'running' } : t));
    
    // Simulate test duration with a promise
    await new Promise(resolve => setTimeout(resolve, tests[i].duration));
    
    // Set final status based on mock 'shouldFail' property
    setTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: t.shouldFail ? 'failed' : 'passed' } : t));
  }
  setIsTesting(false);
};
```

### 6. Testing Instructions
1.  **User Management**: Navigate to the "User Management" dashboard. Use the filter input to search for "Dr. Evelyn Reed." Change a user's role from "patient" to "provider" using the action menu and verify the role badge updates in the table.
2.  **Analytics**: Navigate to the "Platform Analytics" dashboard. Verify that the charts for user growth and feature usage are rendered. Click the "Export CSV" button and confirm a download is initiated.
3.  **Test Suite**: Navigate to the "Admin Test Suite." Click "Run All Tests." Verify that the tests run sequentially, updating their status, and that the "Database Integrity Check" test correctly shows a "failed" state.
4.  **Moderation**: Go to the "Content Moderation" dashboard. In the "Pending Analyses" tab, click the "Approve" (check) icon for one item and the "Reject" (X) icon for another. Verify that toasts appear confirming your actions.
