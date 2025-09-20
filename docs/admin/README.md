# Admin Suite

### 1. Introduction
The Admin Suite is a collection of dashboards and tools designed for platform administrators to manage users, monitor analytics, moderate content, and resolve support issues. It is the central control panel for maintaining the health and integrity of the MediConnect platform.

### 2. Integration in MediConnect
The Admin Suite is a section of the application with several distinct pages, each represented by a React component. The data is currently mocked but simulates interaction with various backend services.

- **User Management (`/admin-dashboard/users`)**: A dashboard using `@tanstack/react-table` to display, filter, and sort all platform users. Admins can perform actions like changing a user's role or verifying their account. State is managed locally.
- **Platform Analytics (`/admin-dashboard/analytics`)**: A mock dashboard using `recharts` to display key platform metrics like user growth and feature engagement. It simulates what an embedded Grafana or Superset dashboard would look like.
- **Content Moderation (`/admin-dashboard/moderation`)**: A queue-based interface for reviewing user-generated content, such as reported chat messages or AI analyses that need human oversight.
- **Support Ticketing (`/admin-dashboard/support`)**: The admin view for the support ticket system. (See `docs/support/README.md` for details).
- **System Test Suite (`/admin-dashboard/test-suite`)**: An interactive page that simulates running a suite of automated tests against platform services, giving admins a quick way to check system health.

### 3. Benefits
- **Centralized Control**: Consolidates all administrative functions into one secure area.
- **Data-Driven Insights**: The analytics dashboard provides a clear view of platform performance.
- **Efficient Workflows**: Tools like the user management table and moderation queues are designed for efficient administrative work.
- **Proactive Maintenance**: The test suite allows admins to proactively check for system issues.

### 4. Flowchart
```mermaid
flowchart TD
  A[Admin logs in] --> B[Redirect to /admin-dashboard]
  B --> C{Admin Dashboard with feature cards}
  C -->|Clicks "User Management"| D[UserManagement component renders]
  D --> E[Table displays mock user data]
  E --> F{Admin changes a user's role}
  F --> G[Action handler updates local state]
  
  C -->|Clicks "Platform Analytics"| H[AnalyticsDashboard component renders]
  H --> I[Recharts displays mock charts]
  
  C -->|Clicks "Support Tickets"| J[SupportDashboard component renders]
  J --> K[Fetches tickets from mock store]
```

### 5. Key Code Snippets
**User Management Table Definition (`user-management.tsx`):**
```javascript
const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "User", ... },
  { accessorKey: "role", header: "Role", ... },
  {
    id: "actions",
    cell: ({ row }) => {
      // ... DropdownMenu with actions like "Make Admin", "Delete User"
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
    
    // Simulate test duration
    await new Promise(resolve => setTimeout(resolve, tests[i].duration));
    
    // Set final status based on mock 'shouldFail' property
    setTests(prev => prev.map((t, idx) => idx === i ? { ...t, status: t.shouldFail ? 'failed' : 'passed' } : t));
  }
  setIsTesting(false);
};
```

### 6. Testing Instructions
1.  **User Management**: Navigate to the "User Management" dashboard. Use the filter input to search for "Dr. Evelyn Reed." Change a user's role from "patient" to "provider" using the action menu and verify the badge updates in the table.
2.  **Analytics**: Navigate to the "Platform Analytics" dashboard. Verify that the charts for user growth and feature usage are rendered.
3.  **Test Suite**: Navigate to the "Admin Test Suite." Click "Run All Tests." Verify that the tests run sequentially, updating their status, and that the "Database Integrity Check" test correctly shows a "failed" state.
4.  **Moderation**: Go to the "Content Moderation" dashboard. In the "Pending Analyses" tab, "approve" one item and "reject" another. Verify that toasts appear confirming your actions.
