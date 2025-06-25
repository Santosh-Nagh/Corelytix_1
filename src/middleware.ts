// File: /src/middleware.ts
// Description: FINAL, ROBUST VERSION. This middleware no longer performs crypto
// verification itself. Instead, it calls the '/api/auth/session' endpoint
// to leverage the stable Node.js runtime for verification. This is the definitive
// fix for the redirect loop.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // First, get the session cookie from the incoming request.
  const sessionCookie = req.cookies.get('session');

  // If the user is trying to access a protected route without a session cookie,
  // redirect them directly to the login page.
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Now, construct the absolute URL for our internal session verification API.
  // This is crucial for the middleware to be able to fetch from itself.
  const verifyUrl = new URL('/api/auth/session', req.url);

  try {
    // Make a fetch request to our own API endpoint. We must forward the
    // session cookie along with the request.
    const response = await fetch(verifyUrl, {
      headers: {
        'Cookie': `session=${sessionCookie.value}`,
      },
    });

    // If the API returns a non-200 status code (e.g., 401), the session is invalid.
    if (!response.ok) {
      // Redirect to the login page if the session is not valid.
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // If the API returns a successful response, the token is valid.
    // Allow the original request to proceed to the protected page (e.g., /admin).
    return NextResponse.next();

  } catch (err) {
    console.error('Middleware verification fetch failed:', err);
    // If the fetch itself fails for any reason, redirect to login as a safe fallback.
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// This config ensures the middleware runs only on the specified protected routes.
export const config = {
  matcher: [
    '/admin/:path*',
    '/orders/:path*',
  ],
};
