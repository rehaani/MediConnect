# Community Chat (Conceptual)

### 1. Introduction
A community chat feature is envisioned for MediConnect to foster communication and support among patients and healthcare providers. The chosen technology for this conceptual feature is **Rocket.Chat**, a powerful, open-source, and fully customizable communication platform that can be self-hosted, ensuring data privacy and security.

### 2. Integration in MediConnect (Conceptual Plan)
The integration of Rocket.Chat is conceptual in this prototype, with the UI elements and hooks in place for a future implementation. The "Community Chat" card on the dashboards links to a placeholder page that describes this future feature.

- **Embedding Strategy**: The plan is to embed the Rocket.Chat web client directly within a dedicated page of the MediConnect app using an `<iframe>`.
- **Single Sign-On (SSO)**: The most critical integration point is authentication. To provide a seamless user experience, users would be automatically logged into Rocket.Chat using their existing MediConnect credentials. This would be achieved via a token-based SSO flow:
    1.  When a user navigates to the chat page, the MediConnect backend would validate their session.
    2.  The backend would then make a server-to-server API call to a self-hosted Rocket.Chat instance to create a user account if one doesn't exist.
    3.  Finally, the backend would generate a short-lived, single-use authentication token for that user.
    4.  The client would receive this token and use it to log into the embedded Rocket.Chat client automatically.
- **Role-Based Channels**: Rocket.Chat would be configured with specific channels based on user roles to manage discussions:
    -   `#general-community`: A public channel for all patients to share experiences and support.
    -   `#verified-providers`: A private, invitation-only channel for healthcare providers to discuss clinical topics.
    -   `#announcements`: A read-only channel where admins can post platform updates.
    -   Direct messages between users would also be supported.
- **UI Placeholder**: The current "Community Chat" card on the dashboards links to `/community-chat`, a placeholder page that informs the user that the feature is "Coming Soon."

### 3. Benefits of Using Rocket.Chat
- **Open Source & Self-Hosted**: Provides complete control over the platform and data, with no vendor lock-in, which is critical for healthcare applications.
- **HIPAA-Ready Security**: Offers end-to-end encryption, robust moderation tools, and detailed audit trails, all essential for handling sensitive health-related discussions.
- **Feature-Rich**: Supports threaded conversations, private groups, file sharing, video conferencing, and extensive API integrations.
- **Scalable**: Can be deployed in a high-availability configuration to support a large number of concurrent users.

### 4. Conceptual SSO Flowchart
```mermaid
flowchart TD
  A[User clicks "Community Chat" card] --> B{Request to MediConnect Backend API}
  B --> C[Backend validates user's Firebase Auth token]
  C --> D{Backend makes API call to Rocket.Chat server to get/create user}
  D --> E[Rocket.Chat returns a user ID]
  E --> F{Backend uses admin credentials to generate a login token for that user ID}
  F --> G[Backend returns login token to the client]
  G --> H[Client loads the /community-chat page]
  H --> I{Embedded Rocket.Chat client initializes with the login token}
  I --> J[User is automatically logged in and joins channels based on their role]
```

### 5. Key Code Snippets
**Conceptual Firebase Function for SSO Token Generation:**
```javascript
// This is a conceptual Firebase Function demonstrating the SSO logic.
exports.generateRocketChatToken = functions.https.onCall(async (data, context) => {
  // 1. Verify Firebase Auth token to ensure the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }
  const uid = context.auth.uid;
  const firebaseUser = await admin.auth().getUser(uid);

  // 2. Use the Rocket.Chat Admin API to find or create a user.
  const rocketChatUserId = await createOrGetUserInRocketChat(firebaseUser);

  // 3. Generate a temporary login token for that user via the Rocket.Chat API.
  const loginToken = await generateLoginTokenForUser(rocketChatUserId);
  
  // 4. Return the token to the client.
  return { token: loginToken };
});
```

### 6. Testing Instructions
As this is a conceptual feature, there are no functional tests. The only current test is to verify the placeholder page.
1.  **UI Placeholder**: Log in as any user. Click on the "Community Chat" card on the dashboard.
2.  **Verify Page**: Confirm that you are navigated to the `/community-chat` page and that it correctly displays the "Coming Soon!" message and a brief explanation of the planned feature.
