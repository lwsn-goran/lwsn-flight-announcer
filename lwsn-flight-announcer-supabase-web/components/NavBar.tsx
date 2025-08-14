'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  useEffect(()=>{
    const supa = createClient();
    supa.auth.getUser().then(({ data })=> setUser(data.user || null));
  },[]);
  return (
    <nav className="flex justify-between items-center py-2 mb-4 border-b">
      <Link href="/" className="font-semibold">LWSN</Link>
      <div className="flex gap-3">
        <Link href="/announce">Announce</Link>
        <Link href="/admin">Admin</Link>
        {user ? <Link href="/profile">Profile</Link> : <Link href="/(auth)/login">Login</Link>}
      </div>
    </nav>
  );
}
