import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

function initialsFor(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'P'
  );
}

export function PublicBlogChrome({
  username,
  displayName,
  active,
  children,
}: {
  username: string;
  displayName: string;
  active: 'home' | 'writing';
  children: React.ReactNode;
}) {
  const navLink = (isActive: boolean) =>
    `rounded-full px-3 py-1.5 transition ${
      isActive
        ? 'bg-[#efede6] text-[#292a25]'
        : 'text-[#77786f] hover:bg-[#f5f3ec] hover:text-[#292a25]'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf6] text-[#1f201b]">
      <header className="border-b border-[#ece9e1]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href={`/${username}`}
            className="group flex min-w-0 items-center gap-2.5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#292a25] text-[11px] font-semibold text-[#f7f5ee]">
              {initialsFor(displayName)}
            </span>
            <span className="truncate text-sm font-semibold tracking-[-0.015em]">
              {displayName}
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-1 text-xs font-medium">
            <Link
              href={`/${username}`}
              className={navLink(active === 'home')}
            >
              Home
            </Link>
            <Link
              href={`/${username}/blog`}
              className={navLink(active === 'writing')}
            >
              Writing
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-[#ece9e1]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-[11px] text-[#9a9b92] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {displayName}
          </p>
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-1 transition hover:text-[#292a25]"
          >
            Visit the website
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function PublicBlogUnavailable({ displayName }: { displayName: string }) {
  return (
    <div className="mx-auto grid min-h-[60vh] w-full max-w-xl place-items-center px-6 text-center">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a2a398]">
          {displayName}
        </p>
        <h1 className="mt-4 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.035em] text-[#1f201b]">
          This journal is temporarily unavailable.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#85867d]">
          The owner can restore it by choosing a Pageory plan.
        </p>
      </div>
    </div>
  );
}
