'use client';

import { createContext, useContext, useState } from 'react';

export type LayoutMode = 'order-book' | 'depth-view' | 'buy-order' | 'sell-order';

interface OrderBookLayoutContextValue {
  layout: LayoutMode;
  setLayout: (l: LayoutMode) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const OrderBookLayoutContext = createContext<OrderBookLayoutContextValue | null>(null);

export function OrderBookLayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<LayoutMode>('order-book');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <OrderBookLayoutContext.Provider value={{ layout, setLayout, modalOpen, setModalOpen }}>
      {children}
    </OrderBookLayoutContext.Provider>
  );
}

export function useOrderBookLayout() {
  const ctx = useContext(OrderBookLayoutContext);
  if (!ctx) throw new Error('useOrderBookLayout must be used within OrderBookLayoutProvider');
  return ctx;
}
