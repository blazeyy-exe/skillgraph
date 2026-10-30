"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig, isSupabaseConfigured } from "@/lib/config";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  if (!url || !anonKey) {
    return null;
  }
  return createBrowserClient(url, anonKey);
}

export { isSupabaseConfigured };
