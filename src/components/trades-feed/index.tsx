'use client';

import { useHyperliquid } from '@/hooks/use-hyperliquid';
import Trades from '@/components/order-book/trades';

export default function TradesFeed({ coin }: { coin: string }) {
  const { trades } = useHyperliquid(coin as 'BTC' | 'ETH');

  return (
    <div className="h-[638px] overflow-y-auto">
      <Trades trades={trades} coin={coin} />
    </div>
  );
}
