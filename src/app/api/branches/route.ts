// File: src/app/api/branches/route.ts
// Description: FINAL VERSION. This API correctly calls the new database function.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const { data: branches, error } = await supabase
    .from('Branch')
    .select('*')
    .eq('organizationId', session.orgId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
  return NextResponse.json(branches || []);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, address, contact, gstin } = body;

    if (!name || !address || !contact || !gstin) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Call our secure database function.
    const { data, error } = await supabase.rpc('create_new_branch', {
      name_input: name,
      address_input: address,
      contact_input: contact,
      gstin_input: gstin
    });

    if (error) {
      console.error('Error creating branch via RPC:', error);
      return NextResponse.json({ error: error.message || 'Failed to create branch.' }, { status: 500 });
    }

    // The function now returns the new branch object directly.
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
