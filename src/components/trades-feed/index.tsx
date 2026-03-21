'use client';

import { useHyperliquid } from '@/hooks/use-hyperliquid';
import Trades from '@/components/order-book/trades';
import { useTradesLayout } from '@/context/trades-layout';
import { useCoin } from '@/context/coin';
import { TRADES_CONTAINER_HEIGHT_PX } from '@/helpers/constants';

export default function TradesFeed() {
  const { coin } = useCoin();
  const { trades } = useHyperliquid(coin);
  const { layout } = useTradesLayout();

  return (
    <div className="overflow-y-auto" style={{ height: TRADES_CONTAINER_HEIGHT_PX }}>
      <Trades trades={trades} coin={coin} layout={layout} />
    </div>
  );
}
