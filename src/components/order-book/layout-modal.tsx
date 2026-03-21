'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { OrderBook, DepthView, BuyOrder, SellOrder } from '@/components/icons';
import { useOrderBookLayout, type LayoutMode } from '@/context/order-book-layout';

const OPTIONS: { id: LayoutMode; label: string; Icon: React.FC }[] = [
  { id: 'order-book', label: 'Order Book', Icon: OrderBook },
  { id: 'depth-view', label: 'Depth View', Icon: DepthView },
  { id: 'buy-order', label: 'Buy Order', Icon: BuyOrder },
  { id: 'sell-order', label: 'Sell Order', Icon: SellOrder },
];

interface Props {
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function LayoutModal({ triggerRef }: Props) {
  const { layout, setLayout, modalOpen, setModalOpen } = useOrderBookLayout();
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
        className="fixed z-50 rounded-xl bg-[#1c1c21] border border-white/10 shadow-xl p-1"
        style={{ top: pos.top, right: pos.right }}
      >
        <div className="grid grid-cols-2 gap-1">
          {OPTIONS.map(({ id, label, Icon }) => {
            const isActive = layout === id;
            return (
              <button
                key={id}
                onClick={() => { setLayout(id); setModalOpen(false); }}
                className={`flex flex-col items-center gap-2 px-5 py-3 rounded-[8px] text-xs font-mono transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-[#fafafa]'
                    : 'text-[#a7a7b7] hover:bg-white/5 hover:text-[#fafafa]'
                }`}
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
