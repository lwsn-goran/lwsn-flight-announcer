'use client';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { createClient } from '@/lib/supabaseClient';

export default function AdminPage() {
  const supa = createClient();
  const [runway, setRunway] = useState<string|undefined>(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notams, setNotams] = useState<any[]>([]);
  const [special, setSpecial] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [durationType, setDurationType] = useState<'HOURS'|'DAYS'|'UNTIL_REMOVED'>('UNTIL_REMOVED');
  const [durationValue, setDurationValue] = useState<number>(24);

  useEffect(()=>{
    async function init() {
      const { data } = await supa.auth.getUser();
      if (!data.user) { window.location.href = '/(auth)/login'; return; }
      const prof = await supa.from('profiles').select('is_admin').eq('id', data.user.id).single();
      setIsAdmin(!!prof.data?.is_admin);

      const r = await fetch('/api/runway'); setRunway((await r.json()).runway||null);
      const n = await fetch('/api/notams'); setNotams((await n.json()).notams||[]);
      const s = await fetch('/api/special'); setSpecial((await s.json()).items||[]);
    }
    init();
  },[]);

  async function setRwy(r: '30'|'12') {
    if (!isAdmin) return alert('Admin only');
    await fetch('/api/runway', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ runway: r, override: true }) });
    const resp = await fetch('/api/runway'); setRunway((await resp.json()).runway||null);
  }

  async function postNotam() {
    if (!isAdmin) return alert('Admin only');
    await fetch('/api/notams', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title, body }) });
    setTitle(''); setBody('');
    const n = await fetch('/api/notams'); setNotams((await n.json()).notams||[]);
  }

  async function postSpecial() {
    if (!isAdmin) return alert('Admin only');
    await fetch('/api/special', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title, body, duration_type: durationType, duration_value: durationValue })
    });
    setTitle(''); setBody('');
    const s = await fetch('/api/special'); setSpecial((await s.json()).items||[]);
  }

  return (
    <div>
      <NavBar />
      <h1 className="text-xl font-semibold mb-3">Admin</h1>
      {!isAdmin && <div className="text-sm text-red-600 mb-2">You are not an admin. View-only.</div>}

      <section className="border p-3 rounded mb-4">
        <div className="mb-2">Runway in use: <strong>{runway? 'RWY '+runway : 'Not set'}</strong></div>
        <div className="flex gap-2">
          <button className="border p-2" onClick={()=>setRwy('30')}>Set RWY 30</button>
          <button className="border p-2" onClick={()=>setRwy('12')}>Set RWY 12</button>
        </div>
      </section>

      <section className="border p-3 rounded">
        <div className="font-semibold mb-2">Post NOTAM</div>
        <input className="border p-2 w-full mb-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="border p-2 w-full mb-2" placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} />
        <button className="border p-2 mr-2" onClick={postNotam}>Publish NOTAM</button>
      </section>

      <section className="border p-3 rounded mt-4">
        <div className="font-semibold mb-2">Special Announcement (yellow banner)</div>
        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <select className="border p-2" value={durationType} onChange={e=>setDurationType(e.target.value as any)}>
            <option value="HOURS">Hours</option>
            <option value="DAYS">Days</option>
            <option value="UNTIL_REMOVED">Until removed</option>
          </select>
          <input className="border p-2" type="number" min="1" value={durationValue} onChange={e=>setDurationValue(parseInt(e.target.value||'1'))} />
          <textarea className="border p-2 col-span-2" placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} />
        </div>
        <button className="border p-2 mt-2" onClick={postSpecial}>Publish Special</button>
      </section>

      <section className="mt-4 border p-3 rounded">
        <div className="font-semibold mb-2">Existing Specials</div>
        <ul className="list-disc pl-4">
          {special.map((n:any)=> <li key={n.id}><strong>{n.title}</strong> — {n.body}</li>)}
        </ul>
      </section>
    </div>
  );
}
