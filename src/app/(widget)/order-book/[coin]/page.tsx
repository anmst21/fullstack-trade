import OrderBook from '@/components/order-book';

export function generateStaticParams() {
  return [
    { coin: 'BTC' },
    { coin: 'ETH' },
    { coin: 'SOL' },
    { coin: 'HYPE' },
  ];
}

export default function OrderBookPage() {
  return <OrderBook />;
}
