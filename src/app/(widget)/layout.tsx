import Tabs from '@/components/order-book/tabs';

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex justify-center pt-8 px-4">
      <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[#131316] border border-white/5">
        <Tabs />
        {children}
      </div>
    </main>
  );
}
