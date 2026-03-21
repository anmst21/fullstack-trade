import TradesFeed from '@/components/trades-feed';

export function generateStaticParams() {
  return [
    { coin: 'BTC' },
    { coin: 'ETH' },
    { coin: 'SOL' },
    { coin: 'HYPE' },
  ];
}

export default function TradesPage() {
  return <TradesFeed />;
}
