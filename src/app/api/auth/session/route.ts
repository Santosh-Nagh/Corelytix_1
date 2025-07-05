// File: /src/app/api/auth/session/route.ts
// Description: Session verification commented out. This route now returns a mock session.
// Uncomment the code below to re-enable JWT session verification.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { jwtVerify } from 'jose';

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secure-and-long-secret-key-for-jwt');

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('session');

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // COMMENTED OUT: JWT session verification
  /*
  try {
    // Use the same 'jose' library to verify the token that was used to create it.
    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    // If verification is successful, return the session data from the token's payload.
    return NextResponse.json(payload);
  } catch (err) {
    // If verification fails, the token is invalid or expired.
    console.log('Session check failed:', err);
    return NextResponse.json({ error: 'Session is invalid or has expired' }, { status: 401 });
  }
  */

  // TEMPORARY: Mock session for development
  // Remove this when re-enabling JWT verification
  const mockSession = {
    userId: 'mock-user-id',
    name: 'Demo User',
    role: 'admin',
    email: 'demo@example.com',
    orgId: 'mock-org-id'
  };

  return NextResponse.json(mockSession);
}