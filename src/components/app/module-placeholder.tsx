import Link from "next/link";

export function ModulePlaceholder({
  title,
  phase,
  description,
}: {
  title: string;
  phase: number;
  description: string;
}) {
  return (
    <section>
      <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Phase {phase}</p>
      <h1 className="mt-2 font-serif text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">{description}</p>
      <p className="mt-6 max-w-2xl text-ink">
        This route is real and protected. It does not show sample skills, invented conversations, or
        fake opportunities. The module will store live data when its phase is implemented.
      </p>
      <Link href="/app" className="mt-8 inline-block text-sm underline">
        Back to overview
      </Link>
    </section>
  );
}
