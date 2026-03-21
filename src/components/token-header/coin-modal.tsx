'use client';

import { useEffect, useState } from 'react';
import cn from 'classnames';
import { createPortal } from 'react-dom';
import { useCoin } from '@/context/coin';
import { fmtPrice } from '@/helpers/formatters';
import { coinIconUrl } from '@/helpers/urls';

const FEATURED = ['BTC', 'ETH', 'HYPE', 'SOL'] as const;

interface Props {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  onClose: () => void;
}

export default function CoinModal({ triggerRef, open, onClose }: Props) {
  const { coin, setCoin, allMeta } = useCoin();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
    });
  }, [open, triggerRef]);

  if (!open || !pos) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-xl bg-[var(--color-surface-modal)] border border-white/10 shadow-xl overflow-hidden"
        style={{ top: pos.top, left: pos.left, minWidth: 340 }}
      >
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs text-[var(--text-secondary)] px-3 py-2 border-b border-white/5">
          <span>Symbol</span>
          <span className="text-right">Last Price</span>
          <span className="text-right w-[80px]">24h Change</span>
        </div>

        {/* Rows */}
        {FEATURED.map((c) => {
          const meta = allMeta.get(c);
          if (!meta) return null;

          const markPx = parseFloat(meta.markPx);
          const prevDayPx = parseFloat(meta.prevDayPx);
          const change = prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;
          const isPositive = change >= 0;
          const isActive = coin === c;

          return (
            <button
              key={c}
              onClick={() => { setCoin(c); onClose(); }}
              className={cn('grid grid-cols-[1fr_auto_auto] gap-4 items-center w-full px-3 py-2 text-sm transition-colors cursor-pointer', isActive ? 'bg-white/10' : 'hover:bg-white/5')}
            >
              <div className="flex items-center gap-2">
                <img
                  src={coinIconUrl(c)}
                  alt={c}
                  width={20}
                  height={20}
                  className={cn('rounded-full border', c === 'HYPE' ? 'border-white bg-black' : 'border-white/10 bg-white')}
                />
                <span className="font-bold text-[var(--text-primary)] whitespace-nowrap">
                  {c}<span className="text-[var(--text-secondary)] font-normal">/USDC</span>
                </span>
                <span className="text-[9px] font-bold rounded px-1 py-[1px]" style={{ color: 'var(--color-bid)', background: 'var(--color-bid-badge)' }}>
                  {meta.maxLeverage}×
                </span>
              </div>
              <span className="text-right text-[var(--text-primary)] tabular-nums">
                {fmtPrice(markPx)}
              </span>
              <span
                className="text-right w-[80px] tabular-nums"
                style={{ color: isPositive ? 'var(--color-bid)' : 'var(--color-ask)' }}
              >
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </>,
    document.body,
  );
}
