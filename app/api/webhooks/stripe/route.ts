import { headers as nextHeaders } from 'next/headers';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await nextHeaders()).get('stripe-signature');
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
      type SubLite = {
        id: string;
        status: Stripe.Subscription.Status;
        customer: string | Stripe.Customer | Stripe.DeletedCustomer;
        current_period_end?: number;
      };
      const sub = (await stripe.subscriptions.retrieve(subId)) as unknown as SubLite;

      const currentPeriodEndIso =
        sub.current_period_end != null
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

      await supabaseAdmin.from('subscriptions').upsert({
        id: sub.id,
        user_id: userId,
        stripe_customer_id:
          typeof sub.customer === 'string'
            ? sub.customer
            : (sub.customer as Stripe.Customer).id,
        status: sub.status,
        current_period_end: currentPeriodEndIso,
      });
    }
  } else if (
  event.type === 'customer.subscription.updated' ||
  event.type === 'customer.subscription.deleted'
) {
  type SubLite = {
    id: string;
    status: Stripe.Subscription.Status;
    customer: string | Stripe.Customer | Stripe.DeletedCustomer;
    current_period_end?: number;
  };
  const sub = event.data.object as unknown as SubLite;

  const currentPeriodEndIso =
    sub.current_period_end != null
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null;

  await supabaseAdmin.from('subscriptions').upsert({
    id: sub.id,
    stripe_customer_id:
      typeof sub.customer === 'string'
        ? sub.customer
        : (sub.customer as Stripe.Customer).id,
    status: sub.status,
    current_period_end: currentPeriodEndIso,
  });
}


  return new Response('ok', { status: 200 });
}
