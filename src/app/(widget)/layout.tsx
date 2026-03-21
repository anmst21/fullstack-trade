import Tabs from '@/components/order-book/tabs';
import TokenHeader from '@/components/token-header';
import { CoinProvider } from '@/context/coin';
import { OrderBookLayoutProvider } from '@/context/order-book-layout';
import { TradesLayoutProvider } from '@/context/trades-layout';

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <CoinProvider>
      <OrderBookLayoutProvider>
        <TradesLayoutProvider>
          <main className="flex justify-center px-4">
            <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[#131316] border border-white/5">
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
