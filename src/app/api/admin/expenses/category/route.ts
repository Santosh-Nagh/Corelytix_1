// File: /src/app/api/admin/expenses/category/route.ts
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
    .select('amount, category')
    .eq('organizationId', session.orgId);
    
  if (error) {
    console.error('Error fetching expenses by category:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses by category' }, { status: 500 });
  }

  const expensesByCategory = (data || []).reduce((acc, curr) => {
    const category = curr.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const formattedData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    total: value,
  }));

  return NextResponse.json(formattedData);
}
