'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    setLoading(true);
    const res = await fetch('/api/checkout', { method: 'POST' });
    if (res.status === 401) { router.push('/login?next=/pricing'); return; }
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">Pro plan</h1>
      <button onClick={subscribe} disabled={loading} className="px-4 py-2 bg-black text-white">
        {loading ? 'Redirecting…' : 'Subscribe'}
      </button>
    </main>
  );
}
