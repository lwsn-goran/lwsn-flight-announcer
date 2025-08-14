'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Login() {
  const supa = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onLogin(e:any) {
    e.preventDefault();
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/';
  }
  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onLogin} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border p-2 w-full">Login</button>
      </form>
      <div className="text-sm mt-3">No account? <Link className="underline" href="/(auth)/signup">Sign up</Link></div>
    </div>
  );
}
