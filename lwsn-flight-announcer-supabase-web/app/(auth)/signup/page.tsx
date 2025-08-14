'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Signup() {
  const supa = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  async function onSignup(e:any) {
    e.preventDefault();
    const { error } = await supa.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) alert(error.message);
    else window.location.href = '/';
  }
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSignup} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border p-2 w-full">Sign up</button>
      </form>
    </div>
  );
}
