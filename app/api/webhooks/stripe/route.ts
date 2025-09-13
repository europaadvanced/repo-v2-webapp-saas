// ...imports and earlier code unchanged...

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const subId = s.subscription as string | null;
    const userId = (s.metadata?.user_id as string) || null;
    if (subId && userId) {
      const subResp = await stripe.subscriptions.retrieve(subId);
      const sub = subResp as unknown as Stripe.Subscription;

      await supabaseAdmin.from('subscriptions').upsert({
        id: sub.id,
        user_id: userId,
        stripe_customer_id: sub.customer as string,
        status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
    }
  } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await supabaseAdmin.from('subscriptions').upsert({
      id: sub.id,
      stripe_customer_id: sub.customer as string,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    });
  }

  return new Response('ok', { status: 200 });
