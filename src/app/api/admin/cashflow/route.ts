// File: /src/app/api/admin/cashflow/route.ts
// Description: FINAL. Uses the getSession helper for auth and is multi-tenant aware.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('Transaction')
    .select('amount, type, createdAt')
    .eq('organizationId', session.orgId)
    .order('createdAt', { ascending: true });

  if (error) {
    console.error('Error fetching cash flow data:', error);
    return NextResponse.json({ error: 'Failed to fetch cash flow data' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
