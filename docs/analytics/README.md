# Platform Analytics (Conceptual)

### 1. Introduction
To monitor platform health, user engagement, and public health trends, MediConnect is designed to integrate with a powerful data visualization tool like Grafana or Apache Superset. These open-source platforms excel at creating real-time, interactive dashboards from various data sources, providing invaluable insights for platform administrators.

### 2. Integration in MediConnect
This feature is currently conceptual, with the analytics dashboard in the app (`src/app/admin-dashboard/analytics/page.tsx`) serving as a placeholder or mockup of what the final embedded visualization tool would look like.

- **Data Source Strategy**: The primary data source would be a data warehouse (e.g., Google BigQuery) that aggregates and anonymizes data from the production Firestore database. A regular ETL (Extract, Transform, Load) job would be responsible for this data transfer process, ensuring that production database performance is not impacted by analytics queries.
- **Dashboarding Tool**: A tool like Grafana or Superset would connect to the BigQuery data warehouse. Within this tool, administrators could build dashboards to visualize key metrics, such as:
    -   User growth and demographics.
    -   Feature engagement rates (e.g., which features are most used).
    -   Appointment statistics (e.g., booking rates, popular specialties).
    -   Anonymized health trends based on AI analyzer inputs.
- **Embedding in the App**: The chosen tool provides options for embedding dashboards into external applications, typically via an `<iframe>`. The main analytics dashboard would be embedded directly into the "Platform Analytics" page of the MediConnect admin suite.
- **Secure Authentication**: Access to the embedded dashboard would be secured using a token-based authentication method like JWT. The MediConnect backend would generate a short-lived, signed token for an authenticated admin user, which would be passed to the embedding URL to grant temporary access. This prevents unauthorized access to the analytics data.

### 3. Benefits
- **Real-time Insights**: Provides administrators with up-to-the-minute insights into platform activity, enabling quick responses to issues or trends.
- **Data-Driven Decisions**: Helps identify which features are most used, where users might be dropping off, and potential public health trends based on anonymized symptom data.
- **Highly Customizable**: Both Grafana and Superset are highly customizable, allowing the creation of tailored visualizations and dashboards specific to MediConnect's needs.
- **Scalable and Performant**: By separating the analytics data store from the production database, this architecture ensures that both systems can scale independently without performance degradation.

### 4. Flowchart of the Conceptual Architecture
```mermaid
flowchart TD
  subgraph "Data Pipeline (Backend)"
    A[Production Firestore Database] -->|Scheduled ETL Job| B[BigQuery Data Warehouse (Anonymized Data)]
  end

  subgraph "Dashboarding Service"
    B --> C[Grafana/Superset connects to BigQuery]
    C --> D[Admins build dashboards in Grafana/Superset]
  end

  subgraph "Admin View (MediConnect App)"
    E[Admin navigates to Analytics page] --> F{MediConnect backend verifies admin auth}
    F --> G[Backend generates a signed embed token for Grafana/Superset]
    G --> H[Page loads with an iframe pointing to the embedded dashboard URL, using the token]
    H --> I[Admin interacts with live data securely]
  end
```

### 5. Mockup Implementation
The current application includes a mock analytics dashboard built with `recharts` to simulate the final user experience.

-   **Path**: `src/components/dashboard/admin/analytics-dashboard.tsx`
-   **Functionality**: It displays static summary cards and two charts: a line chart for user growth and a pie chart for feature usage. It also includes a mock "Export CSV" button that demonstrates how data could be downloaded.

### 6. Testing Instructions
Since this feature is a mockup of a conceptual integration, testing is limited to the UI.
1.  **UI Mockup**: Navigate to the admin dashboard and then to the "Platform Analytics" page. Verify that the mockup dashboard with summary cards, charts, and a data table is displayed correctly.
2.  **Data Export**: Click the "Export CSV" button. Verify that a CSV file containing the mock audit log data is downloaded, demonstrating the placeholder functionality.
