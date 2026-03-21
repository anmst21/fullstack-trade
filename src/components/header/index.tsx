import { Logo } from '../icons';
import { FULLSTACK_TRADE_URL } from '@/helpers/urls';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 sm:pt-6 sm:pb-3">
      <nav className="mx-auto max-w-[500px] bg-[var(--color-surface)] rounded-xl overflow-hidden border border-white/5">
        <div className="h-10 sm:h-14 px-4 lg:px-6 flex items-center justify-between">

          {/* Logo: icon + wordmark */}
          <a href={FULLSTACK_TRADE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 shrink-0">
            <Logo className="h-6 sm:h-8 w-auto" />
            <span className="hidden md:inline text-[var(--text-primary)] font-medium tracking-wider text-xs sm:text-sm uppercase">
              Fullstack
            </span>
          </a>

          {/* Order Book badge */}
          <span className="inline-flex items-center gap-2 h-6 sm:h-8 px-3 sm:px-4 rounded-full bg-[var(--color-ask)]/10 border border-[var(--color-ask)]/30 font-mono uppercase tracking-[0.08em] text-[10px] sm:text-xs text-[var(--color-ask)]">
            <span className="relative w-2 h-2 shrink-0">
              <span
                className="absolute inset-0 rounded-full bg-[var(--color-dot-ring)]"
                style={{ animation: 'dot-ring 2s cubic-bezier(.4, 0, .6, 1) infinite' }}
                aria-hidden="true"
              />
              <span className="relative w-2 h-2 rounded-full bg-[var(--color-ask)] animate-pulse block" />
            </span>
            Order Book
          </span>

        </div>
      </nav>
    </header>
  );
}
