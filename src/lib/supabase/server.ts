import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseBrowserConfig } from "@/lib/config";

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component; proxy.ts refreshes the session.
        }
      },
    },
  });
}
