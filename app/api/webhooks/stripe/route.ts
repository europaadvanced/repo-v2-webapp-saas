import { headers } from 'next/headers';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const subId = s.subscription as string | null;
    const userId = (s.metadata?.user_id as string) || null;
    if (subId && userId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      await supabaseAdmin.from('subscriptions').upsert({
        id: sub.id,
        user_id: userId,
        stripe_customer_id: sub.customer as string,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
    }
  } else if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin.from('subscriptions').upsert({
      id: sub.id,
      stripe_customer_id: sub.customer as string,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    });
  }

  return new Response('ok', { status: 200 });
}
