'use client';

import { createContext, useContext } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useAssetMeta, type AssetMeta } from '@/hooks/use-asset-meta';

interface CoinContextValue {
  coin: string;
  setCoin: (c: string) => void;
  meta: AssetMeta | undefined;
  allMeta: Map<string, AssetMeta>;
}

const CoinContext = createContext<CoinContextValue | null>(null);

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ coin?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const coin = (params.coin ?? 'BTC').toUpperCase();
  const allMeta = useAssetMeta();
  const meta = allMeta.get(coin);

  function setCoin(c: string) {
    // Replace the coin segment in the current path
    // e.g. /order-book/BTC → /order-book/ETH
    const segments = pathname.split('/');
    segments[segments.length - 1] = c;
    router.push(segments.join('/'));
  }

  return (
    <CoinContext.Provider value={{ coin, setCoin, meta, allMeta }}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoin() {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error('useCoin must be used within CoinProvider');
  return ctx;
}
