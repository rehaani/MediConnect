/**
 * This is a mock database for demonstration purposes.
 * In a real application, you would use a proper database like Firestore.
 */
import type {
  AuthenticatorDevice,
  CredentialDeviceType,
} from '@simplewebauthn/server/script/deps';

interface User {
  id: string;
  email: string;
  currentChallenge?: string;
}

interface StoredCredential extends AuthenticatorDevice {
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
  transports: CredentialDeviceType[];
}

// Mock User Table
const users: User[] = [
  {
    id: 'user-evelyn-reed',
    email: 'dr.evelyn.reed@medconnect.com',
  },
];

// Mock Credentials Table
const credentials: {[userId: string]: StoredCredential[]} = {};

export function findUser(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function getCredentialsForUser(userId: string): StoredCredential[] {
  return credentials[userId] || [];
}

export function getCredentialById(
  credentialID: string
): StoredCredential | undefined {
  for (const userId in credentials) {
    const cred = credentials[userId].find(
      c => bufferToBase64URL(c.credentialID) === credentialID
    );
    if (cred) {
      return cred;
    }
  }
  return undefined;
}

export function addCredential(userId: string, newCredential: any) {
  if (!credentials[userId]) {
    credentials[userId] = [];
  }
  credentials[userId].push(newCredential);
}

export function updateCredentialCounter(
  credentialID: Uint8Array,
  newCounter: number
) {
  for (const userId in credentials) {
    const cred = credentials[userId].find(c => c.credentialID === credentialID);
    if (cred) {
      cred.counter = newCounter;
      return;
    }
  }
}

function bufferToBase64URL(buffer: Uint8Array): string {
    return Buffer.from(buffer).toString('base64url');
}
