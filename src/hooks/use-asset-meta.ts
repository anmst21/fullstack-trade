'use client';

import { useEffect, useState } from 'react';

export interface AssetMeta {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  prevDayPx: string;
  markPx: string;
  dayNtlVlm: string;
}

interface RawUniverse {
  name: string;
  szDecimals: number;
  maxLeverage: number;
}

interface RawAssetCtx {
  prevDayPx: string;
  markPx: string;
  dayNtlVlm: string;
}

let cached: Map<string, AssetMeta> | null = null;

export function useAssetMeta() {
  const [assets, setAssets] = useState<Map<string, AssetMeta>>(cached ?? new Map());

  useEffect(() => {
    if (cached) return;

    fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
    })
      .then((r) => r.json())
      .then(([meta, assetCtxs]: [{ universe: RawUniverse[] }, RawAssetCtx[]]) => {
        const map = new Map<string, AssetMeta>();
        for (let i = 0; i < meta.universe.length; i++) {
          const u = meta.universe[i];
          const ctx = assetCtxs[i];
          map.set(u.name, {
            name: u.name,
            szDecimals: u.szDecimals,
            maxLeverage: u.maxLeverage,
            prevDayPx: ctx?.prevDayPx ?? '0',
            markPx: ctx?.markPx ?? '0',
            dayNtlVlm: ctx?.dayNtlVlm ?? '0',
          });
        }
        cached = map;
        setAssets(map);
      })
      .catch(() => {});
  }, []);

  return assets;
}
