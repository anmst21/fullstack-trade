import { Logo } from '../icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-6 pb-3">
      <nav className="mx-auto max-w-[500px] bg-[#131316] rounded-xl overflow-hidden border border-white/5">
        <div className="h-14 px-4 lg:px-6 flex items-center justify-between">

          {/* Logo: icon + wordmark */}
          <a href="https://www.fullstack.trade/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 shrink-0">
            <Logo className="h-8 w-auto" />
            <span className="hidden md:inline text-[#fafafa] font-medium tracking-wider text-sm uppercase">
              Fullstack
            </span>
          </a>

          {/* Order Book badge */}
          <span className="inline-flex items-center gap-2 h-8 px-4 rounded-full bg-[#FF3100]/10 border border-[#FF3100]/30 font-mono uppercase tracking-[0.08em] text-xs text-[#FF3100]">
            <span className="relative w-2 h-2 shrink-0">
              <span
                className="absolute inset-0 rounded-full bg-[#f0f757]"
                style={{ animation: 'dot-ring 2s cubic-bezier(.4, 0, .6, 1) infinite' }}
                aria-hidden="true"
              />
              <span className="relative w-2 h-2 rounded-full bg-[#FF3100] animate-pulse block" />
            </span>
            Order Book
          </span>

        </div>
      </nav>
    </header>
  );
}
