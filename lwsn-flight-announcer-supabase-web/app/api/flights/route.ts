import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

function summarize(legs:any[]) {
  if (!legs?.length) return '';
  return legs.map(l => `${l.op_type}: ${l.origin||''} → ${l.destination||''} (${l.etd||l.eta||''})`).join(' | ');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope'); // PUBLIC or MINE
  const supa = createClient();
  if (scope === 'PUBLIC') {
    const { data, error } = await supa.from('flights_public_view').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ flights: data });
  }
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ flights: [] });
  const { data, error } = await supa.from('flights').select('*, legs(*)').eq('profile_id', user.id).order('created_at', { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const shaped = data.map((f:any)=> ({ id:f.id, status:f.status, summary: summarize(f.legs), aircraft_registration:f.aircraft_registration }));
  return NextResponse.json({ flights: shaped });
}

export async function POST(req: Request) {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

  const body = await req.json();
  const { aircraft_registration, aircraft_type, legs, runway_pref } = body || {};
  if (!aircraft_registration || !Array.isArray(legs) || legs.length < 1) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const { data: flight, error: fErr } = await supa.from('flights').insert({
    profile_id: user.id, aircraft_registration, aircraft_type, status: 'PLANNED'
  }).select().single();
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 });

  const legsPayload = legs.map((l:any)=> ({ flight_id: flight.id, op_type: l.op_type, origin: l.origin, destination: l.destination, etd: l.etd || null, eta: l.eta || null }));
  const { error: lErr } = await supa.from('legs').insert(legsPayload);
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  if ((runway_pref === '30' || runway_pref === '12')) {
    const { data: current } = await supa.from('runway_in_use').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!current) await supa.from('runway_in_use').insert({ runway: runway_pref, active: true });
  }
  return NextResponse.json({ ok: true, flight_id: flight.id });
}
