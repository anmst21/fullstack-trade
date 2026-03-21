'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useLayoutEffect, useState } from 'react';
import { useOrderBookLayout } from '@/context/order-book-layout';
import { useTradesLayout } from '@/context/trades-layout';
import LayoutModal from './layout-modal';
import TradesLayoutModal from '@/components/trades-feed/layout-modal';

const TABS = [
  { href: '/order-book', label: 'Order Book' },
  { href: '/trades', label: 'Trades' },
];

export default function Tabs() {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const isTradesRoute = pathname === '/trades';
  const { modalOpen: obModalOpen, setModalOpen: setObModalOpen } = useOrderBookLayout();
  const { modalOpen: trModalOpen, setModalOpen: setTrModalOpen } = useTradesLayout();
  const modalOpen = isTradesRoute ? trModalOpen : obModalOpen;
  const setModalOpen = isTradesRoute ? setTrModalOpen : setObModalOpen;
  const dotsRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const activeIdx = TABS.findIndex((t) => t.href === pathname);
    const el = tabRefs.current[activeIdx];
    if (!el) return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [pathname]);

  return (
    <div className="relative flex items-center border-b border-white/5">
      {TABS.map(({ href, label }, i) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            ref={(el) => { tabRefs.current[i] = el; }}
            href={href}
            className={`px-4 py-3 text-base font-medium transition-colors ${
              isActive ? 'text-[#fafafa]' : 'text-[#a7a7b7] hover:text-[#fafafa]'
            }`}
          >
            {label}
          </Link>
        );
      })}

      {/* sliding indicator */}
      <span
        className="absolute bottom-0 h-[2px] bg-[#A1FF00]"
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
          className="px-4 py-3 text-[#a7a7b7] hover:text-[#fafafa] transition-colors cursor-pointer"
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
