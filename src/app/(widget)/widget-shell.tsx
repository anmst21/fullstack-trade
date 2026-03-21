'use client';

import Tabs from '@/components/order-book/tabs';
import TokenHeader from '@/components/token-header';
import { CoinProvider } from '@/context/coin';
import { OrderBookLayoutProvider } from '@/context/order-book-layout';
import { TradesLayoutProvider } from '@/context/trades-layout';

export default function WidgetShell({ children }: { children: React.ReactNode }) {
  return (
    <CoinProvider>
      <OrderBookLayoutProvider>
        <TradesLayoutProvider>
          <main className="flex justify-center px-4">
            <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[var(--color-surface)] border border-white/5">
              <TokenHeader />
              <Tabs />
              {children}
            </div>
          </main>
        </TradesLayoutProvider>
      </OrderBookLayoutProvider>
    </CoinProvider>
  );
}
