// File: /src/app/api/admin/revenue/total/route.ts
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

  const { data: revenueData, error: revenueError } = await supabase
    .from('Transaction')
    .select('amount')
    .eq('type', 'income')
    .eq('organizationId', session.orgId);

  if (revenueError) {
    console.error('Error fetching total revenue:', revenueError);
    return NextResponse.json({ error: 'Failed to fetch total revenue' }, { status: 500 });
  }

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.amount, 0) || 0;

  return NextResponse.json({ totalRevenue });
}
