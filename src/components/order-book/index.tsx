"use client";

import { useMemo, useState } from "react";
import { useHyperliquid } from "@/hooks/use-hyperliquid";
import { useCoin } from "@/context/coin";
import Book from "./book";
import BottomBar from "./bottom-bar";

export const MULTIPLIERS = [1, 2, 5, 10, 100, 1000];
const NSIGFIGS_BY_IDX = [5, 5, 5, 4, 3, 2] as const;

export default function OrderBook() {
  const { coin } = useCoin();
  const [groupIdx, setGroupIdx] = useState(0);
  const [asset, setAsset] = useState<string>(coin);
  const nSigFigs = NSIGFIGS_BY_IDX[groupIdx];
  const { book } = useHyperliquid(coin, nSigFigs);

  const refPrice = book.asks[0]?.px ?? book.bids[0]?.px;
  const [lastOptions, setLastOptions] = useState<number[]>([]);
  const groupOptions = useMemo(() => {
    if (!refPrice) return lastOptions;
    const magnitude = Math.floor(Math.log10(parseFloat(refPrice)));
    const step = parseFloat(Math.pow(10, magnitude - 4).toPrecision(6));
    return MULTIPLIERS.map((m) => parseFloat((step * m).toPrecision(6)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refPrice]);

  if (groupOptions.length > 0 && groupOptions !== lastOptions) {
    setLastOptions(groupOptions);
  }

  const group = groupOptions[groupIdx];

  return (
    <>
      <div className="overflow-y-auto">
        <Book
          bids={book.bids}
          asks={book.asks}
          spread={book.spread}
          coin={coin}
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
