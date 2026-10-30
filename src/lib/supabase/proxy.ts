import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseBrowserConfig, isDemoMode } from "@/lib/config";
import { isAuthPath, isProtectedPath } from "@/lib/auth/paths";

export async function updateSession(request: NextRequest) {
  const { url, anonKey } = getSupabaseBrowserConfig();
  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    if (isProtectedPath(request.nextUrl.pathname)) {
      if (isDemoMode()) {
        return response;
      }
      const login = new URL("/login", request.url);
      login.searchParams.set("next", request.nextUrl.pathname);
      login.searchParams.set("reason", "unconfigured");
      return NextResponse.redirect(login);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedPath(pathname)) {
    if (isDemoMode()) {
      return response;
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (user && isAuthPath(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}
