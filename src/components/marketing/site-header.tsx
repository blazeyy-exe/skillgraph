import Link from "next/link";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ signedIn }: { signedIn?: boolean }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
          SkillGraph
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hidden text-ink-soft hover:text-ink sm:inline">
              {link.label}
            </Link>
          ))}
          {signedIn ? (
            <Link href="/app" className="rounded-sm bg-accent px-3 py-2 text-paper-raised hover:bg-accent-hover">
              Open workspace
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-ink hover:underline">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-sm bg-accent px-3 py-2 text-paper-raised hover:bg-accent-hover"
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
