'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useLayoutEffect, useState } from 'react';
import { useOrderBookLayout } from '@/context/order-book-layout';
import { useTradesLayout } from '@/context/trades-layout';
import { useCoin } from '@/context/coin';
import cn from 'classnames';
import LayoutModal from './layout-modal';
import TradesLayoutModal from '@/components/trades-feed/layout-modal';

const TABS = [
  { route: 'order-book', label: 'Order Book' },
  { route: 'trades', label: 'Trades' },
];

export default function Tabs() {
  const pathname = usePathname();
  const { coin } = useCoin();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const isTradesRoute = pathname.startsWith('/trades');
  const { modalOpen: obModalOpen, setModalOpen: setObModalOpen } = useOrderBookLayout();
  const { modalOpen: trModalOpen, setModalOpen: setTrModalOpen } = useTradesLayout();
  const modalOpen = isTradesRoute ? trModalOpen : obModalOpen;
  const setModalOpen = isTradesRoute ? setTrModalOpen : setObModalOpen;
  const dotsRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const activeIdx = TABS.findIndex((t) => pathname.startsWith(`/${t.route}`));
    const el = tabRefs.current[activeIdx];
    if (!el) return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [pathname]);

  return (
    <div className="relative flex items-center border-y border-white/5">
      {TABS.map(({ route, label }, i) => {
        const isActive = pathname.startsWith(`/${route}`);
        return (
          <Link
            key={route}
            ref={(el) => { tabRefs.current[i] = el; }}
            href={`/${route}/${coin}`}
            className={cn('px-4 py-3 text-base font-medium transition-colors', isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
          >
            {label}
          </Link>
        );
      })}

      {/* sliding indicator */}
      <span
        className="absolute bottom-0 h-[2px] bg-[var(--color-bid)] z-10"
        style={{
          left: indicator.left,
          width: indicator.width,
          transition: 'left 0.2s ease-out, width 0.2s ease-out',
        }}
      />

      {/* 3-dots button + modal */}
      <div className="ml-auto">
        <button
          ref={dotsRef}
          onClick={() => setModalOpen(!modalOpen)}
          className="px-4 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.2" />
            <circle cx="8" cy="8" r="1.2" />
            <circle cx="8" cy="13" r="1.2" />
          </svg>
        </button>
        {isTradesRoute
          ? <TradesLayoutModal triggerRef={dotsRef} />
          : <LayoutModal triggerRef={dotsRef} />
        }
      </div>
    </div>
  );
}
