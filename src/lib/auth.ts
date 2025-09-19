
export type UserRole = 'patient' | 'provider' | 'admin';

export type User = {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  language: 'en' | 'hi';
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
    },
    provider: {
      name: 'Dr. Evelyn Reed',
      email: 'dr.evelyn.reed@medconnect.com',
      role: 'provider',
      avatar: 'https://picsum.photos/seed/provider/200/200',
      language: 'en',
    },
    admin: {
      name: 'Sam Chen',
      email: 's.chen.admin@medconnect.com',
      role: 'admin',
      avatar: 'https://picsum.photos/seed/admin/200/200',
      language: 'en',
    },
  };

  return userMap[effectiveRole];
}
