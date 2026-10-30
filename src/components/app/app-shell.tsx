"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { APP_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
        <Link href="/app" className="font-serif text-xl">
          SkillGraph
        </Link>
        <button
          type="button"
          className="rounded-sm border border-line px-3 py-1.5 text-sm"
          aria-expanded={open}
          aria-controls="app-nav"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      <aside
        id="app-nav"
        className={cn(
          "border-b border-line bg-paper-raised px-3 py-4 lg:min-h-screen lg:border-b-0 lg:border-r",
          open ? "block" : "hidden lg:block",
        )}
      >
        <Link href="/app" className="mb-6 hidden px-2 font-serif text-2xl lg:block">
          SkillGraph
        </Link>
        <p className="px-2 text-xs uppercase tracking-[0.16em] text-ink-soft">Workspace</p>
        <nav aria-label="Application" className="mt-2 flex flex-col gap-0.5">
          {APP_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-sm px-2 py-2 text-sm",
                  active ? "bg-accent-soft text-ink" : "text-ink-soft hover:bg-paper hover:text-ink",
                )}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                {!item.ready ? (
                  <span className="text-[10px] uppercase tracking-wider text-ink-soft">Soon</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <form action={logoutAction} className="mt-8 px-2">
          <p className="mb-2 truncate text-sm text-ink">{name}</p>
          <button type="submit" className="text-sm text-ink-soft underline hover:text-ink">
            Log out
          </button>
        </form>
      </aside>
      <div className="min-w-0">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
