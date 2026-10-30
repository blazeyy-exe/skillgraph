import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>SkillGraph — abilities beyond qualifications.</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}
