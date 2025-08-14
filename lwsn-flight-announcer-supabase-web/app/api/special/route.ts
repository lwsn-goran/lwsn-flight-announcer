import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  const supa = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supa.from('special_announcements').select('*')
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: Request) {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });
  const { data: prof } = await supa.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json();
  const { title, body: text, duration_type, duration_value } = body || {};
  if (!title || !text) return NextResponse.json({ error: 'title and body required' }, { status: 400 });

  let expires_at = null as string | null;
  if (duration_type === 'HOURS' && duration_value) {
    const d = new Date(); d.setHours(d.getHours() + Number(duration_value));
    expires_at = d.toISOString();
  } else if (duration_type === 'DAYS' && duration_value) {
    const d = new Date(); d.setDate(d.getDate() + Number(duration_value));
    expires_at = d.toISOString();
  }
  const { error } = await supa.from('special_announcements').insert({ title, body: text, active: true, expires_at });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
