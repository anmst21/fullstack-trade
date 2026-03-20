import Header from '@/components/header';
import OrderBook from '@/components/order-book';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex justify-center pt-8 px-4">
        <OrderBook />
      </main>
    </div>
  );
}
