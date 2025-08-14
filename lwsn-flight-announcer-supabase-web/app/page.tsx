'use client';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';

export default function Home() {
  const [runway, setRunway] = useState<{runway:string|null,set_at?:string|null}>({runway:null});
  const [notams, setNotams] = useState<any[]>([]);
  const [special, setSpecial] = useState<any[]>([]);
  const [awos, setAwos] = useState<{summary:string,details:string}|null>(null);
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/runway').then(r=>r.json()).then(setRunway).catch(()=>{});
    fetch('/api/notams').then(r=>r.json()).then(d=>setNotams(d.notams||[])).catch(()=>{});
    fetch('/api/special').then(r=>r.json()).then(d=>setSpecial(d.items||[])).catch(()=>{});
    fetch('/api/weather').then(r=>r.json()).then(d=>setAwos(d)).catch(()=>{});
    fetch('/api/flights?scope=PUBLIC').then(r=>r.json()).then(d=>setFlights(d.flights||[])).catch(()=>{});
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/service-worker.js'); }
  }, []);

  return (
    <div>
      <NavBar />
      <h1 className="text-xl font-semibold mb-3">Dashboard — LWSN</h1>

      {!!special.length && (
        <section className="border p-3 rounded mb-3 bg-yellow-100">
          <div className="font-semibold mb-1">Special Announcements</div>
          <ul className="list-disc pl-5">
            {special.map((s:any) => (
              <li key={s.id}>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm">{s.body}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-4">
        <section className="border p-3 rounded">
          <div className="text-sm text-gray-500">Runway in use</div>
          <div className="text-3xl font-bold">{runway.runway ? `RWY ${runway.runway}` : 'Not set'}</div>
          {runway.set_at && (<div className="text-xs text-gray-500">since {new Date(runway.set_at).toLocaleString()}</div>)}
        </section>

        <section className="border p-3 rounded">
          <div className="text-sm text-gray-500">Stenkovec AWOS (WeatherLink)</div>
          <div className="font-mono break-words">{awos?.summary || '...'}</div>
        </section>

        {!!notams.length && (
          <section className="border p-3 rounded">
            <div className="text-sm text-gray-500">NOTAMs</div>
            <ul className="list-disc pl-5">
              {notams.map((n:any) => (
                <li key={n.id}>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm">{n.body}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="border p-3 rounded">
          <div className="text-sm text-gray-500 mb-2">Active Flights</div>
          {!flights.length && <div className="text-sm text-gray-500">No active flights</div>}
          <ul className="space-y-2">
            {flights.map((f:any) => (
              <li key={f.id} className="border rounded p-2">
                <div className="flex justify-between">
                  <div className="font-semibold">{f.aircraft_registration}</div>
                  <div className="text-xs px-2 py-0.5 rounded bg-gray-100">{f.status}</div>
                </div>
                <div className="text-sm">{f.summary}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
