'use client';

import Tabs from '@/components/order-book/tabs';
import TokenHeader from '@/components/token-header';
import { OrderBookLayoutProvider } from '@/context/order-book-layout';

export default function WidgetShell({ children }: { children: React.ReactNode }) {
  return (
    <OrderBookLayoutProvider>
      <main className="flex justify-center px-4">
        <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[var(--color-surface)] border border-white/5">
          <TokenHeader />
          <Tabs />
          {children}
        </div>
      </main>
    </OrderBookLayoutProvider>
  );
}
