# WebRTC Video Consultation

### 1. Introduction
WebRTC (Web Real-Time Communication) is a free, open-source project that provides web browsers and mobile applications with real-time communication (RTC) capabilities via simple APIs. It allows for peer-to-peer audio and video communication to work inside web pages by allowing direct communication, eliminating the need to install plugins or download native apps.

### 2. Integration in MediConnect
Our WebRTC implementation is designed to be robust and scalable, using Firebase for signaling and coordination.

- **Signaling**: We use the Firebase Realtime Database as a signaling server. When a doctor initiates a call, a "room" is created in the database. The patient joins this room using a unique ID, and they exchange the necessary metadata (like network information and media capabilities) to establish a direct connection.
- **Offer/Answer Model**: The connection follows the standard WebRTC offer/answer model. The initiating client (doctor) creates an "offer," and the receiving client (patient) responds with an "answer."
- **ICE Servers**: We use Google's public STUN servers to facilitate the discovery of public IP addresses. For users behind complex NATs, a TURN server is configured as a fallback to relay traffic.
- **UI Component**: The entire video call experience is encapsulated within the `WebRTCVideoCall.tsx` React component, which manages the call state, media streams, and user controls.

### 3. Benefits
- **Low Latency**: Direct peer-to-peer connections result in minimal lag, which is critical for medical consultations.
- **Cost-Effective**: Since media is streamed directly between users, we avoid significant server bandwidth costs.
- **Security**: Media streams are encrypted end-to-end between peers by default.
- **Integrated Controls**: Users have in-app controls to mute/unmute audio, enable/disable video, and end the call, all managed within the component's state.

### 4. Flowchart
```mermaid
flowchart TD
  A[Doctor clicks Start Call] --> B{Cloud Function creates room in RTDB}
  B --> C{Room ID generated & Offer created}
  C --> D[Doctor's PeerConnection.createOffer()]
  D --> E[Patient joins with Room ID]
  E --> F[Patient's PeerConnection.createAnswer()]
  F --> G[ICE candidates exchanged via RTDB]
  G --> H[Direct P2P media stream established]
  H --> I{Doctor/Patient clicks End Call}
  I --> J[PeerConnection.close()]
  J --> K[RTDB room data is cleaned up]
```

### 5. Key Code Snippets
**Creating a Call Room (Doctor's side, conceptual)**
```javascript
// In WebRTCVideoCall.tsx
const handleStartCall = async () => {
  const newPc = new RTCPeerConnection(servers);
  // ... add tracks, etc.
  const offerDescription = await newPc.createOffer();
  await newPc.setLocalDescription(offerDescription);

  const callDocRef = doc(firestore, 'calls', 'some-unique-id');
  await setDoc(callDocRef, { offer: { sdp: offerDescription.sdp, type: offerDescription.type } });
  // ... listen for answer and ICE candidates
};
```

**Joining a Call (Patient's side, conceptual)**
```javascript
// In WebRTCVideoCall.tsx
const handleJoinCall = async (roomId) => {
  const callDocRef = doc(firestore, 'calls', roomId);
  const callData = (await getDoc(callDocRef)).data();
  
  const newPc = new RTCPeerConnection(servers);
  await newPc.setRemoteDescription(new RTCSessionDescription(callData.offer));

  const answerDescription = await newPc.createAnswer();
  await newPc.setLocalDescription(answerDescription);

  await updateDoc(callDocRef, { answer: { sdp: answerDescription.sdp, type: answerDescription.type } });
  // ... listen for ICE candidates
};
```

**Ending a Call**
```javascript
// In WebRTCVideoCall.tsx
const hangUp = () => {
  pc.close();
  // ... stop media tracks and clean up Firestore document
};
```

### 6. Testing Instructions
1.  **Pre-Answer Cancel**: As a provider, start a new consultation. Before the patient joins, click the "Cancel Call" button. Verify that the call is terminated and the room data in Firestore is removed.
2.  **Mid-Call End (Provider)**: Establish a call between a provider and a patient. As the provider, click "End Call." Verify that both users' connections are closed and they are redirected to their respective dashboards.
3.  **Mid-Call End (Patient)**: Establish a call. As the patient, click "End Call." Verify the same behavior as above.
4.  **Network Interruption**: Use browser developer tools to simulate an offline state for one user. The call should gracefully terminate for both users after the ICE connection state times out.
