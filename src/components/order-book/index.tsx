"use client";

import { useState } from "react";
import { useHyperliquid } from "@/hooks/use-hyperliquid";
import Tabs, { type Tab } from "./tabs";
import Book from "./book";
import Trades from "./trades";

export default function OrderBook() {
  const [tab, setTab] = useState<Tab>("book");
  const { trades, book } = useHyperliquid("BTC");

  return (
    <div className="w-full max-w-[500px] rounded-xl overflow-hidden bg-[#131316] border border-white/5">
      <Tabs active={tab} onChange={setTab} />
      <div className="h-[662px] overflow-y-auto">
        {tab === "book" ? (
          <Book bids={book.bids} asks={book.asks} />
        ) : (
          <Trades trades={trades} />
        )}
      </div>
    </div>
  );
}
