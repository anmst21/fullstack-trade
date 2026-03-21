'use client';

import { useHyperliquid } from '@/hooks/use-hyperliquid';
import Trades from '@/components/order-book/trades';
import { useTradesLayout } from '@/context/trades-layout';
import { useCoin } from '@/context/coin';

export default function TradesFeed() {
  const { coin } = useCoin();
  const { trades } = useHyperliquid(coin);
  const { layout } = useTradesLayout();

  return (
    <div className="h-[638px] overflow-y-auto">
      <Trades trades={trades} coin={coin} layout={layout} />
    </div>
  );
}
