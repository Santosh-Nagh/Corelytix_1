// File: /src/lib/session.ts
// Description: A centralized helper function to get the current user's
// session from the secure cookie. All protected API routes will use this.

import { cookies } from 'next/headers';
import { jwtVerify, JWTPayload } from 'jose';

// Define the shape of our session payload
export interface SessionPayload extends JWTPayload {
  userId: string;
  name: string;
  role: string;
  email?: string;
  orgId: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secure-and-long-secret-key-for-jwt');

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('session');

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    // Type assertion to ensure the payload matches our expected shape
    return payload as SessionPayload;
  } catch (err) {
    console.error('Session verification failed in getSession:', err);
    return null;
  }
}
