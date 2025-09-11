import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { priceId } = await req.json().catch(() => ({ priceId: null }));
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId ?? process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.SITE_URL}/dashboard?success=1&cs_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/pricing`,
    allow_promotion_codes: true,
  });
  return Response.json({ url: session.url });
}
