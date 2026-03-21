import Tabs from '@/components/order-book/tabs';
import { OrderBookLayoutProvider } from '@/context/order-book-layout';
import { TradesLayoutProvider } from '@/context/trades-layout';

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrderBookLayoutProvider>
      <TradesLayoutProvider>
        <main className="flex justify-center pt-8 px-4">
          <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[#131316] border border-white/5">
            <Tabs />
            {children}
          </div>
        </main>
      </TradesLayoutProvider>
    </OrderBookLayoutProvider>
  );
}
