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
