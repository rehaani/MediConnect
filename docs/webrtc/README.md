# WebRTC Video Consultation

### 1. Introduction
**WebRTC** (Web Real-Time Communication) is a free, open-source project that provides web browsers and mobile applications with real-time communication (RTC) capabilities via simple APIs. It allows for peer-to-peer audio and video streaming directly between browsers, eliminating the need for a central media server and reducing latency and cost.

### 2. Integration in MediConnect
Our WebRTC implementation is designed to be robust and scalable for one-on-one video calls, using Firebase for the critical "signaling" process.

- **Signaling Server**: We use the **Firebase Realtime Database** as our signaling server. Signaling is the process of coordinating the connection; it's how peers find and exchange the metadata needed to talk to each other. When a host (provider) initiates a call, a "room" is created in the Realtime Database with a unique ID. The guest (patient) then joins this room to exchange connection details.
- **Offer/Answer Model**: The connection follows the standard WebRTC offer/answer model:
    1.  The initiating client (the provider) creates an "offer" (a block of text describing its media capabilities) and saves it to the database room.
    2.  The receiving client (the patient) reads this offer, creates an "answer," and saves it back to the room.
    3.  Once both have exchanged this information, they know how to connect.
- **ICE Candidates**: To traverse network firewalls and NATs, WebRTC uses a framework called **ICE**. Peers exchange "ICE candidates" (potential network paths) through the signaling server. Once they find a compatible path, they can establish a direct peer-to-peer connection.
- **STUN/TURN Servers**: We use Google's public **STUN** servers to help peers discover their public IP addresses. A **TURN** server from the Open Relay Project is also configured as a fallback to relay traffic if a direct connection cannot be established (e.g., due to a very restrictive firewall).
- **UI Component (`WebRTCVideoCall.tsx`)**: The entire video call experience is encapsulated within this React component. It manages the call state (idle, creating, waiting, active, ended), media streams, and user controls (mute, video on/off, hang up).
- **Call Cleanup**: The component is designed to be robust. `onDisconnect` from the Firebase SDK is used to automatically remove the room from the database if the host disconnects abruptly. A `beforeunload` event listener also triggers the `hangUp` function to ensure state is cleaned up when the user closes the tab.

### 3. Benefits
- **Low Latency**: Direct peer-to-peer connections result in minimal lag, which is critical for clear and effective medical consultations.
- **Cost-Effective**: Since media is streamed directly between users, we avoid the significant server bandwidth costs associated with relaying video through a central server.
- **Security**: All WebRTC media streams are encrypted end-to-end between peers by default using DTLS-SRTP.
- **Integrated Controls**: Users have in-app controls to mute/unmute audio, enable/disable video, and end the call, all managed within the component's state.

### 4. Flowchart
```mermaid
flowchart TD
  A[Provider starts call] --> B{A unique Room ID is generated}
  B --> C{Provider creates RTCPeerConnection and creates an "Offer"}
  C --> D[Provider saves Offer to Realtime Database at `calls/{roomId}`]
  D --> E[Patient joins with the Room ID]
  E --> F{Patient reads Offer from DB and creates an "Answer"}
  F --> G[Patient saves Answer to DB]
  G --> H{Provider reads Answer and sets remote description}
  H --> I[ICE candidates are exchanged via the database]
  I --> J[Direct, encrypted P2P media stream is established]
  J --> K{Either user clicks "End Call"}
  K --> L[pc.close() is called on both ends]
  L --> M[Database room data is removed]
```

### 5. Key Code Snippets
**Creating a Call Room (Provider's side, simplified logic from `WebRTCVideoCall.tsx`)**
```javascript
// This logic runs when the component mounts for the host (provider)
const newPc = new RTCPeerConnection(servers);
localStream.getTracks().forEach(track => newPc.addTrack(track, localStream));

// Listen for ICE candidates and add them to the database
newPc.onicecandidate = event => {
  if (event.candidate) {
    const candidateRef = ref(db, `calls/${roomId}/offerCandidates/...`);
    set(candidateRef, event.candidate.toJSON());
  }
};

// Create offer and set it in the database
const offerDescription = await newPc.createOffer();
await newPc.setLocalDescription(offerDescription);
const offer = { sdp: offerDescription.sdp, type: offerDescription.type };
await set(ref(db, `calls/${roomId}`), { offer });

// Listen for the patient's answer
onValue(ref(db, `calls/${roomId}/answer`), (snapshot) => {
  if (snapshot.exists()) {
    newPc.setRemoteDescription(new RTCSessionDescription(snapshot.val()));
  }
});
```

### 6. Testing Instructions
1.  **Start a Call (as Provider)**: Log in as a provider and navigate to the provider dashboard. Click "Start Call" for a patient in the queue. This will navigate you to the `/video-consultation` page with a new `roomId` and you should see your local video feed.
2.  **Copy Invite Link**: As the provider in the "waiting" screen, click the "Copy" icon to copy the invite link.
3.  **Join a Call (as Patient)**: Open the copied link in a separate browser (or incognito window). You should be taken to the same video call room.
4.  **Establish Connection**: After a few moments, the connection should be established. You should see the provider's video stream on the patient's screen and vice versa.
5.  **Test Controls**: Test the mute/unmute and video on/off buttons on both ends.
6.  **End Call**: As either the provider or patient, click "End Call." Verify that the call is terminated for both users and they are redirected back to their respective dashboards after a short delay.
7.  **Abrupt Disconnect**: While in a call, close the provider's browser tab. Verify that the call ends for the patient shortly after.
