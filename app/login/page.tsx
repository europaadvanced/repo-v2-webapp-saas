'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false);
  const send = async () => { const { error } = await supabase.auth.signInWithOtp({ email }); if (!error) setSent(true); };
  return (
    <main className="p-10 max-w-md">
      <h1 className="text-2xl mb-4">Sign in</h1>
      {sent ? <p>Check your email.</p> : (
        <div className="space-y-3">
          <input className="border p-2 w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          <button onClick={send} className="px-4 py-2 bg-black text-white">Send magic link</button>
        </div>
      )}
    </main>
  );
}

