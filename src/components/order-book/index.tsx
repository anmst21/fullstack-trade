"use client";

import { useState } from "react";
import { useHyperliquid } from "@/hooks/use-hyperliquid";
import Tabs, { type Tab } from "./tabs";
import Book from "./book";
import Trades from "./trades";
import BottomBar from "./bottom-bar";

export const MULTIPLIERS = [1, 2, 5, 10, 100, 1000];
const NSIGFIGS_BY_IDX = [5, 5, 5, 4, 3, 2] as const;

export default function OrderBook() {
  const [tab, setTab] = useState<Tab>("book");
  const coin = "BTC" as const;
  const [groupIdx, setGroupIdx] = useState(0);
  const [asset, setAsset] = useState<string>(coin);
  const nSigFigs = NSIGFIGS_BY_IDX[groupIdx];
  const { trades, book } = useHyperliquid(coin, nSigFigs);

  // Derive step from current price magnitude — no effect needed
  const refPrice = book.asks[0]?.px ?? book.bids[0]?.px;
  const magnitude = refPrice ? Math.floor(Math.log10(parseFloat(refPrice))) : 4; // default to BTC-like
  const step = parseFloat(Math.pow(10, magnitude - 4).toPrecision(6));
  const groupOptions = MULTIPLIERS.map((m) =>
    parseFloat((step * m).toPrecision(6)),
  );
  const group = groupOptions[groupIdx];

  return (
    <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[#131316] border border-white/5">
      <Tabs active={tab} onChange={setTab} />
      <div className="h-[638px] overflow-y-auto">
        {tab === "book" ? (
          <Book
            bids={book.bids}
            asks={book.asks}
            spread={book.spread}
            coin={coin}
            asset={asset}
            group={group}
          />
        ) : (
          <Trades trades={trades} coin={coin} />
        )}
      </div>
      {tab === "book" && (
        <BottomBar
          coin={coin}
          asset={asset}
          onAssetChange={setAsset}
          groupIdx={groupIdx}
          groupOptions={groupOptions}
          onGroupIdxChange={setGroupIdx}
        />
      )}
    </div>
  );
}
