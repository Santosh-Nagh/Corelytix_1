// File: /src/app/api/admin/revenue/category/route.ts
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

  // This is a complex query. A database function (RPC) would be more efficient in production.
  // For now, we fetch transactions and process them in code.
  const { data, error } = await supabase
    .from('Transaction')
    .select('amount, category')
    .eq('type', 'income')
    .eq('organizationId', session.orgId);

  if (error) {
    console.error('Error fetching revenue by category:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue by category' }, { status: 500 });
  }

  const revenueByCategory = (data || []).reduce((acc, curr) => {
    const category = curr.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const formattedData = Object.entries(revenueByCategory).map(([name, value]) => ({
    name,
    total: value,
  }));

  return NextResponse.json(formattedData);
}
