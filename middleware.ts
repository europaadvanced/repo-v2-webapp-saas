import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // refresh session
  const { data: { session } } = await supabase.auth.getSession();

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data } = await supabase
      .from('subscriptions')
      .select('status,current_period_end')
      .eq('user_id', session.user.id)
      .order('current_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    const active =
      data &&
      ['trialing','active','past_due'].includes(data.status) &&
      data.current_period_end &&
      new Date(data.current_period_end) > new Date();

    if (!active) {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  return res;
}

export const config = { matcher: ['/dashboard/:path*'] };
