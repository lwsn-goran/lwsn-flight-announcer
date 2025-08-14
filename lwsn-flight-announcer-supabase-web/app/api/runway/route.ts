import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  const supa = createClient();
  const { data, error } = await supa.from('runway_in_use').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ runway: data?.runway ?? null, set_at: data?.created_at ?? null });
}

export async function POST(req: Request) {
  const supa = createClient();
  const body = await req.json();
  const runway = body.runway;
  const override = !!body.override;

  if (runway !== '30' && runway !== '12') return NextResponse.json({ error: 'runway must be 30 or 12' }, { status: 400 });

  if (!override) {
    const { data: current } = await supa.from('runway_in_use').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (current) return NextResponse.json({ runway: current.runway, locked: true });
  }
  await supa.from('runway_in_use').update({ active: false }).eq('active', true);
  const { data, error } = await supa.from('runway_in_use').insert({ runway, active: true }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ runway: data.runway, set_at: data.created_at });
}
