'use client';

import { createContext, useContext, useState } from 'react';

export type TradesLayoutMode = 'trades' | 'depth-view' | 'buy-trades' | 'sell-trades';

interface TradesLayoutContextValue {
  layout: TradesLayoutMode;
  setLayout: (l: TradesLayoutMode) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const TradesLayoutContext = createContext<TradesLayoutContextValue | null>(null);

export function TradesLayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<TradesLayoutMode>('trades');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <TradesLayoutContext.Provider value={{ layout, setLayout, modalOpen, setModalOpen }}>
      {children}
    </TradesLayoutContext.Provider>
  );
}

export function useTradesLayout() {
  const ctx = useContext(TradesLayoutContext);
  if (!ctx) throw new Error('useTradesLayout must be used within TradesLayoutProvider');
  return ctx;
}
