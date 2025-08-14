import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  const supa = createClient();
  const { data, error } = await supa.from('notams').select('*').eq('active', true).order('created_at', { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notams: data });
}

export async function POST(req: Request) {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  const { data: prof } = await supa.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { title, body: text } = body || {};
  if (!title || !text) return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  const { error } = await supa.from('notams').insert({ title, body: text, active: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
