// File: /src/app/api/admin/expenses/total/route.ts
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
    .from('Expense')
    .select('amount')
    .eq('organizationId', session.orgId);

  if (error) {
    console.error('Error fetching total expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch total expenses' }, { status: 500 });
  }

  const totalExpenses = data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  return NextResponse.json({ totalExpenses });
}
