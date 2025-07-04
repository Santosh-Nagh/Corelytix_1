// File: src/app/api/auth/login/route.ts
// Description: PIN authentication commented out. This route now returns a mock response.
// Uncomment the code below to re-enable PIN-based authentication.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import { createClient } from '@/lib/supabase/server';
// import { SignJWT } from 'jose';

// IMPORTANT: Your JWT secret should be a long, random string stored securely
// in your environment variables (.env file and on Vercel).
// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'a-very-secure-and-long-secret-key-for-jwt');
// const ALG = 'HS256';

export async function POST(request: Request) {
  const body = await request.json();
  const { pin } = body;

  if (!pin) {
    return NextResponse.json({ error: 'PIN required' }, { status: 400 });
  }

  // COMMENTED OUT: PIN-based authentication
  /*
  const supabase = createClient();

  // Find the user by their PIN code.
  const { data: user, error } = await supabase
    .from('User')
    .select('id, name, email, role, organizationId')
    .eq('pinCode', pin)
    .single(); // .single() ensures only one user is returned for a unique PIN

  if (error || !user) {
    console.error('Login Error:', error?.message);
    return NextResponse.json({ error: 'Invalid PIN or user not found.' }, { status: 401 });
  }

  // Create the session token using 'jose'
  const token = await new SignJWT({
      userId: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      orgId: user.organizationId, // Include orgId in the session
    })
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(JWT_SECRET);

  // Set the session token in a secure, HttpOnly cookie
  cookies().set('session', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return NextResponse.json({ ok: true, role: user.role, name: user.name });
  */

  // TEMPORARY: Mock authentication for development
  // Remove this when re-enabling PIN authentication
  const mockUser = {
    role: 'admin',
    name: 'Demo User'
  };

  // Set a mock session cookie
  cookies().set('session', 'mock-session-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return NextResponse.json({ ok: true, role: mockUser.role, name: mockUser.name });
}