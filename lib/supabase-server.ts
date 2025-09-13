import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => store.get(n)?.value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (n: string, v: string, o?: any) =>
          store.set({ name: n, value: v, ...o }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove: (n: string, o?: any) =>
          store.set({ name: n, value: '', ...o, maxAge: 0 }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    }
  );
}
