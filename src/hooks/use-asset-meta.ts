'use client';

import { useEffect, useState } from 'react';

export interface AssetMeta {
  name: string;
  szDecimals: number;
  maxLeverage: number;
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
      .then(([meta]: [{ universe: AssetMeta[] }]) => {
        const map = new Map<string, AssetMeta>();
        for (const asset of meta.universe) {
          map.set(asset.name, asset);
        }
        cached = map;
        setAssets(map);
      })
      .catch(() => {});
  }, []);

  return assets;
}
