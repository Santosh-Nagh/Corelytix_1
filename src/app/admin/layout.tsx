// File: /src/app/admin/layout.tsx
// Description: FINAL, CORRECTED VERSION. Fixes the import statement for AdminLayout
// to use a named import instead of a default import.

"use client";

import React from 'react';
// THE FIX: Use curly braces {} to import a named export.
import { AdminLayout } from '@/components/admin-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
