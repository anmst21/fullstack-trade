"use client";

import { useState } from "react";
import { useHyperliquid } from "@/hooks/use-hyperliquid";
import { useCoin } from "@/context/coin";
import { useLocalStorage } from "@/hooks/use-local-storage";
import Book from "./book";
import BottomBar from "./bottom-bar";

export const MULTIPLIERS = [1, 2, 5, 10, 100, 1000];
const NSIGFIGS_BY_IDX = [5, 5, 5, 4, 3, 2] as const;

export default function OrderBook() {
  const { coin } = useCoin();
  const [groupIdx, setGroupIdx] = useState(0);
  const [asset, setAsset] = useLocalStorage<string>('ob-asset', coin);
  const nSigFigs = NSIGFIGS_BY_IDX[groupIdx];
  const { book } = useHyperliquid(coin, nSigFigs);

  const refPrice = book.asks[0]?.px ?? book.bids[0]?.px;
  const [groupOptions, setGroupOptions] = useState<number[]>(() => {
    const mag = refPrice ? Math.floor(Math.log10(parseFloat(refPrice))) : 4;
    const step = parseFloat(Math.pow(10, mag - 4).toPrecision(6));
    return MULTIPLIERS.map((m) => parseFloat((step * m).toPrecision(6)));
  });

  if (refPrice) {
    const magnitude = Math.floor(Math.log10(parseFloat(refPrice)));
    const step = parseFloat(Math.pow(10, magnitude - 4).toPrecision(6));
    const next = MULTIPLIERS.map((m) => parseFloat((step * m).toPrecision(6)));
    if (next[0] !== groupOptions[0]) {
      setGroupOptions(next);
    }
  }

  const group = groupOptions[groupIdx];

  return (
    <>
      <div className="overflow-y-auto">
        <Book
          bids={book.bids}
          asks={book.asks}
          spread={book.spread}
          asset={asset}
          group={group}
        />
      </div>
      <BottomBar
        coin={coin}
        asset={asset}
        onAssetChange={setAsset}
        groupIdx={groupIdx}
        groupOptions={groupOptions}
        onGroupIdxChange={setGroupIdx}
      />
    </>
  );
}
