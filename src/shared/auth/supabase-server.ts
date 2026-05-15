import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { AuthProviderUser } from "@/shared/auth/session-types";
import { UnauthorizedError } from "@/shared/errors/application-error";

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function createSupabaseServerClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new UnauthorizedError("Supabase Auth is not configured.");
  }

  const cookieStore = await cookies();
  type CookieToSet = { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] };

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always mutate cookies; auth middleware can refresh sessions later.
        }
      }
    }
  });
}

export async function getSupabaseAuthUser(): Promise<AuthProviderUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  const metadata = data.user.user_metadata as { name?: string; full_name?: string } | null;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    name: metadata?.name ?? metadata?.full_name ?? null
  };
}
