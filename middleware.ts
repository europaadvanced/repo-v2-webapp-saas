import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, o) => res.cookies.set({ name: n, value: v, ...o }),
        remove: (n, o) => res.cookies.set({ name: n, value: '', ...o, maxAge: 0 })
      }
    }
  );
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
  }
  return res;
}
export const config = { matcher: ['/dashboard/:path*'] };
