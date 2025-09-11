'use client';
import { useState } from 'react';

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const checkout = async () => {
    setLoading(true);
    const res = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({}) });
    const { url } = await res.json();
    window.location.href = url;
  };
  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">Pro plan</h1>
      <button onClick={checkout} disabled={loading} className="px-4 py-2 bg-black text-white">
        {loading ? 'Redirecting…' : 'Subscribe'}
      </button>
    </main>
  );
}
