// File: /src/app/api/admin/profit/margin/route.ts
// Description: FINAL. This route was missing from the original project but is needed.
// Uses the getSession helper for auth and is multi-tenant aware.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();

  // Fetch income
  const { data: incomeData, error: incomeError } = await supabase
    .from('Transaction')
    .select('amount')
    .eq('type', 'income')
    .eq('organizationId', session.orgId);

  // Fetch expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from('Expense')
    .select('amount')
    .eq('organizationId', session.orgId);

  if (incomeError || expenseError) {
    console.error('Error fetching profit margin data:', incomeError || expenseError);
    return NextResponse.json({ error: 'Failed to fetch profit margin data' }, { status: 500 });
  }

  const totalIncome = incomeData?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalExpenses = expenseData?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const totalProfit = totalIncome - totalExpenses;

  // Avoid division by zero
  const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;

  return NextResponse.json({ profitMargin });
}
