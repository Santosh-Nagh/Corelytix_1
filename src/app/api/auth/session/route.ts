// File: /src/app/api/auth/session/route.ts
// Description: FINAL, CORRECTED VERSION. This route now uses the 'jose' library
// to verify the session cookie, aligning it with the middleware and login route.
// This is the final fix to solve the redirect loop.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secure-and-long-secret-key-for-jwt');

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('session');

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

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
}
