import { stripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email ?? undefined,
    metadata: { user_id: user.id },
    success_url: `${process.env.SITE_URL}/dashboard?success=1&cs_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/pricing`,
    allow_promotion_codes: true,
  });
  return Response.json({ url: session.url });
}
