"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ signedIn }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
          SkillGraph
        </Link>
        <button
          type="button"
          className="rounded-sm border border-line px-3 py-1.5 text-sm sm:hidden"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <nav
          id="primary-nav"
          aria-label="Primary"
          className={cn(
            "flex-col gap-3 text-sm sm:flex sm:flex-row sm:items-center sm:gap-4",
            open ? "flex" : "hidden sm:flex",
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-soft hover:text-ink"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {signedIn ? (
            <Link
              href="/app"
              className="rounded-sm bg-accent px-3 py-2 text-paper-raised hover:bg-accent-hover"
              onClick={() => setOpen(false)}
            >
              Open workspace
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-ink hover:underline" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm bg-accent px-3 py-2 text-paper-raised hover:bg-accent-hover"
                onClick={() => setOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
