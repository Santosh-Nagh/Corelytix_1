// File: /src/lib/session.ts
// Description: Session helper functions commented out. This now returns mock session data.
// Uncomment the code below to re-enable JWT session verification.

import { cookies } from 'next/headers';
// import { jwtVerify, JWTPayload } from 'jose';

// Define the shape of our session payload
export interface SessionPayload {
  userId: string;
  name: string;
  role: string;
  email?: string;
  orgId: string;
}

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secure-and-long-secret-key-for-jwt');

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('session');

  if (!token) {
    return null;
  }

  // COMMENTED OUT: JWT session verification
  /*
  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    // Type assertion to ensure the payload matches our expected shape
    return payload as SessionPayload;
  } catch (err) {
    console.error('Session verification failed in getSession:', err);
    return null;
  }
  */

  // TEMPORARY: Return mock session data
  // Remove this when re-enabling JWT verification
  return {
    userId: 'mock-user-id',
    name: 'Demo User',
    role: 'admin',
    email: 'demo@example.com',
    orgId: 'mock-org-id'
  };
}