'use client';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { createClient } from '@/lib/supabaseClient';

export default function AnnouncePage() {
  const supa = createClient();
  const [mode, setMode] = useState<'SINGLE'|'MULTI'>('SINGLE');
  const [opType, setOpType] = useState<'ARRIVAL'|'DEPARTURE'>('ARRIVAL');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('LWSN');
  const [etd, setEtd] = useState('');
  const [eta, setEta] = useState('');
  const [aircraftRegistration, setAircraftRegistration] = useState('Z3-TEST');
  const [aircraftType, setAircraftType] = useState('C42');
  const [runwayPref, setRunwayPref] = useState<'30'|'12'|''>('');

  useEffect(()=>{
    supa.auth.getUser().then(({ data })=>{ if(!data.user) window.location.href = '/(auth)/login'; });
  },[]);

  async function submit() {
    const legs = mode === 'SINGLE'
      ? [{ op_type: opType, origin, destination, etd, eta }]
      : [
          { op_type: 'DEPARTURE', origin, destination, etd },
          { op_type: 'ARRIVAL', origin: destination, destination: 'LWSN', eta }
        ];
    const res = await fetch('/api/flights', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ aircraft_registration: aircraftRegistration, aircraft_type: aircraftType, legs, runway_pref: runwayPref })
    });
    if (!res.ok) alert('Error announcing flight'); else window.location.href = '/';
  }

  return (
    <div>
      <NavBar />
      <h1 className="text-xl font-semibold mb-3">Announce Flight</h1>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button className={\`border p-2 \${mode==='SINGLE'?'font-bold':''}\`} onClick={()=>setMode('SINGLE')}>Single</button>
        <button className={\`border p-2 \${mode==='MULTI'?'font-bold':''}\`} onClick={()=>setMode('MULTI')}>Multi</button>
      </div>

      {mode==='SINGLE' && (
        <div className="mb-3">
          <label className="block text-sm">Operation Type</label>
          <select value={opType} onChange={e=>setOpType(e.target.value as any)} className="border p-2 w-full">
            <option value="ARRIVAL">Arrival</option>
            <option value="DEPARTURE">Departure</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <input className="border p-2 w-full" placeholder="Origin (e.g., LWSK)" value={origin} onChange={e=>setOrigin(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Destination (e.g., LWSN)" value={destination} onChange={e=>setDestination(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <input className="border p-2 w-full" type="datetime-local" value={etd} onChange={e=>setEtd(e.target.value)} placeholder="ETD" />
        <input className="border p-2 w-full" type="datetime-local" value={eta} onChange={e=>setEta(e.target.value)} placeholder="ETA" />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <input className="border p-2 w-full" placeholder="Aircraft Reg" value={aircraftRegistration} onChange={e=>setAircraftRegistration(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Aircraft Type" value={aircraftType} onChange={e=>setAircraftType(e.target.value)} />
      </div>

      <div className="mt-2">
        <label className="block mb-1 text-sm">Preferred Runway (if none active)</label>
        <div className="flex gap-2">
          <button className={\`border p-2 \${runwayPref==='30'?'font-bold':''}\`} onClick={()=>setRunwayPref('30')}>RWY 30</button>
          <button className={\`border p-2 \${runwayPref==='12'?'font-bold':''}\`} onClick={()=>setRunwayPref('12')}>RWY 12</button>
          <button className={\`border p-2 \${runwayPref===''?'font-bold':''}\`} onClick={()=>setRunwayPref('')}>No preference</button>
        </div>
      </div>

      <button onClick={submit} className="border p-2 w-full mt-4">Submit Announcement</button>
    </div>
  );
}
