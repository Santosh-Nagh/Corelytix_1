// File: /src/app/page.tsx
// Description: This file is correct. It calls our session API to check for a
// valid session and redirects the user accordingly.

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const res = await fetch('/api/auth/session');
        
        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const session = await res.json();

        if (!session || !session.role) {
            router.replace('/login');
            return;
        }

        const role = session.role;

        if (role === 'admin' || role === 'manager') {
          router.replace('/admin');
        } else if (role === 'cashier' || role === 'helper') {
          router.replace('/orders');
        } else {
          console.warn(`Unknown user role: "${role}". Redirecting to login.`);
          router.replace('/login');
        }

      } catch (error) {
        console.error("An unexpected error occurred during session check:", error);
        router.replace('/login');
      }
    };

    checkSessionAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );
}
