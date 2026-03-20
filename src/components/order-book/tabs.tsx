'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useLayoutEffect, useState } from 'react';

const TABS = [
  { href: '/order-book', label: 'Order Book' },
  { href: '/trades', label: 'Trades' },
];

export default function Tabs() {
  const pathname = usePathname();
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

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

      <button className="ml-auto px-4 py-3 text-[#a7a7b7] hover:text-[#fafafa] transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
    </div>
  );
}
