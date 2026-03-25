'use client';

import { useHyperliquid } from '@/hooks/use-hyperliquid';
import Trades from '@/components/order-book/trades';
import { useTradesLayout } from '@/context/trades-layout';
import { useCoin } from '@/context/coin';
import { usePageVisible } from '@/hooks/use-page-visible';

export default function TradesFeed() {
  const { coin } = useCoin();
  const visible = usePageVisible();
  const { trades } = useHyperliquid(coin, undefined, !visible);
  const { layout } = useTradesLayout();

  return (
    <div className="overflow-y-auto" style={{ height: 'var(--tab-content-h)' }}>
      <Trades trades={trades} coin={coin} layout={layout} />
    </div>
  );
}
