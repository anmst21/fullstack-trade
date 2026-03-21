'use client';

import { useEffect, useState } from 'react';
import cn from 'classnames';
import { createPortal } from 'react-dom';
import { OrderBook, DepthView, BuyOrder, SellOrder } from '@/components/icons';
import { useTradesLayout, type TradesLayoutMode } from '@/context/trades-layout';

const OPTIONS: { id: TradesLayoutMode; label: string; Icon: React.FC }[] = [
  { id: 'trades',      label: 'Trades',      Icon: OrderBook  },
  { id: 'depth-view',  label: 'Depth View',  Icon: DepthView  },
  { id: 'buy-trades',  label: 'Buy Trades',  Icon: BuyOrder   },
  { id: 'sell-trades', label: 'Sell Trades', Icon: SellOrder  },
];

interface Props {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function TradesLayoutModal({ triggerRef }: Props) {
  const { layout, setLayout, modalOpen, setModalOpen } = useTradesLayout();
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!modalOpen || !triggerRef.current) { setPos(null); return; }
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right + 12,
    });
  }, [modalOpen, triggerRef]);

  if (!modalOpen || !pos) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={() => setModalOpen(false)} />
      <div
        className="fixed z-50 rounded-xl bg-[var(--color-surface-modal)] border border-white/10 shadow-xl p-1"
        style={{ top: pos.top, right: pos.right }}
      >
        <div className="grid grid-cols-2 gap-1">
          {OPTIONS.map(({ id, label, Icon }) => {
            const isActive = layout === id;
            return (
              <button
                key={id}
                onClick={() => { setLayout(id); setModalOpen(false); }}
                className={cn('flex flex-col items-center gap-2 px-5 py-3 rounded-[8px] text-xs font-mono transition-colors cursor-pointer', isActive ? 'bg-white/10 text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]')}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>,
    document.body,
  );
}
