'use client';

import dynamic from 'next/dynamic';
import { CoinProvider } from '@/context/coin';
import { TradesLayoutProvider } from '@/context/trades-layout';

const WidgetShell = dynamic(() => import('./widget-shell'), { ssr: false });

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <CoinProvider>
      <TradesLayoutProvider>
        <WidgetShell>{children}</WidgetShell>
      </TradesLayoutProvider>
    </CoinProvider>
  );
}
