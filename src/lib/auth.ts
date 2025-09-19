
export type UserRole = 'patient' | 'provider' | 'admin';
export type Theme = 'light' | 'dark' | 'system';

export type User = {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  language: 'en' | 'hi' | 'de';
  theme: Theme;
};

// This is a mock function. In a real app, you'd get this from your auth provider (e.g., Firebase Auth, NextAuth.js).
export async function getCurrentUser(role?: UserRole): Promise<User> {
  // To test different roles, you can change the default role here or pass one in.
  const effectiveRole = role || 'provider';

  const userMap: Record<UserRole, User> = {
    patient: {
      name: 'Alex Doe',
      email: 'alex.doe@example.com',
      role: 'patient',
      avatar: 'https://picsum.photos/seed/patient/200/200',
      language: 'en',
      theme: 'system',
    },
    provider: {
      name: 'Dr. Evelyn Reed',
      email: 'dr.evelyn.reed@medconnect.com',
      role: 'provider',
      avatar: 'https://picsum.photos/seed/provider/200/200',
      language: 'en',
      theme: 'dark',
    },
    admin: {
      name: 'Sam Chen',
      email: 's.chen.admin@medconnect.com',
      role: 'admin',
      avatar: 'https://picsum.photos/seed/admin/200/200',
      language: 'en',
      theme: 'light',
    },
  };

  return userMap[effectiveRole];
}

// In a real app, this would write to Firestore.
export async function updateUserTheme(userId: string, theme: Theme): Promise<void> {
    console.log(`Simulating update theme for user ${userId} to ${theme}`);
    // In a real app using Firestore:
    // const userRef = doc(db, 'users', userId);
    // await setDoc(userRef, { theme }, { merge: true });
    return Promise.resolve();
}

// In a real app, this would write to Firestore.
export async function updateUserLanguage(userId: string, language: 'en' | 'hi' | 'de'): Promise<void> {
    console.log(`Simulating update language for user ${userId} to ${language}`);
    // In a real app using Firestore:
    // const userRef = doc(db, 'users', userId);
    // await setDoc(userRef, { language }, { merge: true });
    return Promise.resolve();
}
