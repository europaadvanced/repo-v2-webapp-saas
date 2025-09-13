import { headers as nextHeaders } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // minimal no-op webhook just to satisfy the compiler
  const _sig = (await nextHeaders()).get('stripe-signature') ?? '';
  await req.text();
  return new Response('ok', { status: 200 });
}
