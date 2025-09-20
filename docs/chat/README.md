# Community Chat (Rocket.Chat)

### 1. Introduction
Rocket.Chat is a powerful, open-source, and fully customizable communication platform. It allows for real-time conversations, file sharing, and video conferencing, making it an ideal solution for building a secure community chat feature within MediConnect.

### 2. Integration in MediConnect
The integration of Rocket.Chat is conceptual in this prototype, with the UI elements and hooks in place for a future implementation.

- **Conceptual Plan**: The idea is to embed the Rocket.Chat client within a dedicated page of the MediConnect app. Users would be automatically logged into Rocket.Chat using SSO (Single Sign-On) with their existing MediConnect Firebase credentials.
- **Channels**: We would configure role-based channels, such as:
    - A general channel for all patients.
    - A verified-providers-only channel for professional discussion.
    - Private channels for support staff and admins.
- **UI Placeholder**: The "Community Chat" card on the dashboard currently links to a placeholder page. This page would eventually host the embedded Rocket.Chat UI.
- **Authentication**: The most critical integration point is authentication. We would use a Firebase Cloud Function that generates a short-lived login token for Rocket.Chat whenever a user tries to access the chat. This ensures seamless and secure access without requiring a separate login.

### 3. Benefits
- **Open Source**: Complete control over the platform and data, with no vendor lock-in.
- **Secure**: Offers end-to-end encryption and robust moderation tools, which are essential for healthcare-related discussions.
- **Feature-Rich**: Supports threaded conversations, private groups, file sharing, and more.
- **Scalable**: Can support a large number of concurrent users.

### 4. Flowchart
```mermaid
flowchart TD
  A[User clicks "Community Chat" button] --> B{Request to MediConnect Backend}
  B --> C[Cloud Function validates user's Firebase Auth token]
  C --> D{Function generates a temporary Rocket.Chat auth token}
  D --> E[Redirect user to the chat page]
  E --> F{Chat page loads with the auth token}
  F --> G[Embedded Rocket.Chat client uses token to log user in]
  G --> H[User joins default channels based on their role]
  H --> I[User sends/receives messages]
```

### 5. Key Code Snippets
**Cloud Function for SSO (Conceptual):**
```javascript
// A conceptual Firebase Function
exports.generateRocketChatToken = functions.https.onCall(async (data, context) => {
  // 1. Verify Firebase Auth token
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }
  const uid = context.auth.uid;
  const user = await admin.auth().getUser(uid);

  // 2. Create/get user in Rocket.Chat via API
  const rocketChatUserId = await createOrGetUserInRocketChat(user);

  // 3. Generate a login token using Rocket.Chat Admin API
  const loginToken = await generateLoginTokenForUser(rocketChatUserId);
  
  // 4. Return token to the client
  return { token: loginToken };
});
```

### 6. Testing Instructions
Since this is a conceptual feature, testing is not applicable to the current prototype. The steps would be:
1.  **SSO Login**: Log in to MediConnect as a patient. Navigate to the chat page. Verify you are automatically logged into Rocket.Chat without a separate password prompt.
2.  **Role-Based Channels**: As a patient, verify you can see the "General" channel but not the "Providers" channel. Log in as a provider and verify you can see both.
3.  **Message Moderation**: As an admin, log in and send a message as a test patient. Use the admin account to flag and remove the message.
