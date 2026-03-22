'use client';

import { useOrderBookLayout } from '@/context/order-book-layout';

interface Props {
  asset: string;
}

export default function BookColumnHeader({ asset }: Props) {
  const { layout } = useOrderBookLayout();

  if (layout === 'depth-view') {
    return (
      <div className="grid grid-cols-2 text-xs sm:text-sm text-[var(--text-secondary)] border-b border-white/5">
        <div className="grid grid-cols-2 py-1 sm:py-2 px-3">
          <span>Total ({asset})</span>
          <span className="text-right">Price</span>
        </div>
        <div className="grid grid-cols-2 py-1 sm:py-2 px-3 border-l border-white/5">
          <span>Price</span>
          <span className="text-right">Total ({asset})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 text-xs sm:text-sm text-[var(--text-secondary)] px-3 py-1 sm:py-2">
      <span>Price</span>
      <span className="text-right">Size ({asset})</span>
      <span className="text-right">Total ({asset})</span>
    </div>
  );
}
