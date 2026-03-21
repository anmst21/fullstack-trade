"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Book as BookData } from "@/hooks/use-hyperliquid";
import BookSkeleton from "./skeleton";
import { useOrderBookLayout } from "@/context/order-book-layout";
import { applyGrouping } from "@/helpers/orderbook";
import { ROW_COUNT, DEPTH_ROW_COUNT } from "@/helpers/constants";
import type { LayoutProps } from "./book-rows";
import OrderBookLayout from "./layouts/order-book-layout";
import DepthViewLayout from "./layouts/depth-view-layout";
import BuyOrderLayout from "./layouts/buy-order-layout";
import SellOrderLayout from "./layouts/sell-order-layout";

interface BookProps extends BookData {
  asset: string;
  group: number;
}

export default function Book({
  bids,
  asks,
  spread: apiSpread,
  asset,
  group,
}: BookProps) {
  const { layout } = useOrderBookLayout();
  const isLoading = bids.length === 0 && asks.length === 0;
  const isUSDC = asset === "USDC";
  const szDecimals = isUSDC ? 0 : 5;
  const rowCount = layout === "order-book" ? ROW_COUNT : DEPTH_ROW_COUNT;

  const topAsks = useMemo(
    () =>
      applyGrouping(asks, group, "ask")
        .sort((a, b) => parseFloat(b.px) - parseFloat(a.px))
        .slice(0, rowCount),
    [asks, group, rowCount],
  );
  const topBids = useMemo(
    () =>
      applyGrouping(bids, group, "bid")
        .sort((a, b) => parseFloat(b.px) - parseFloat(a.px))
        .slice(0, rowCount),
    [bids, group, rowCount],
  );

  function toDisplaySz(sz: string, px: string) {
    const s = parseFloat(sz);
    return isUSDC ? s * parseFloat(px) : s;
  }

  const { askDisplaySizes, askTotals, bidDisplaySizes, bidTotals, maxTotal } =
    useMemo(() => {
      const askDisplaySizes = topAsks.map((l) => toDisplaySz(l.sz, l.px));
      const askTotals: number[] = new Array(topAsks.length).fill(0);
      let askCum = 0;
      for (let i = topAsks.length - 1; i >= 0; i--) {
        askCum += askDisplaySizes[i];
        askTotals[i] = askCum;
      }

      const bidDisplaySizes = topBids.map((l) => toDisplaySz(l.sz, l.px));
      const bidTotals: number[] = [];
      let bidCum = 0;
      for (let i = 0; i < topBids.length; i++) {
        bidCum += bidDisplaySizes[i];
        bidTotals[i] = bidCum;
      }

      return {
        askDisplaySizes,
        askTotals,
        bidDisplaySizes,
        bidTotals,
        maxTotal: Math.max(askCum, bidCum) || 1,
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topAsks, topBids, isUSDC]);

  // Flash tracking
  const prevSizesRef = useRef<Map<string, number>>(new Map());
  const [flashedPrices, setFlashedPrices] = useState<Set<string>>(new Set());

  useEffect(() => {
    const changed = new Set<string>();
    for (const level of [...topAsks, ...topBids]) {
      const curr = parseFloat(level.sz);
      if (
        prevSizesRef.current.has(level.px) &&
        prevSizesRef.current.get(level.px) !== curr
      ) {
        changed.add(level.px);
      }
      prevSizesRef.current.set(level.px, curr);
    }
    if (changed.size > 0) {
      setFlashedPrices(changed);
      const t = setTimeout(() => setFlashedPrices(new Set()), 300);
      return () => clearTimeout(t);
    }
  }, [topAsks, topBids]);

  if (isLoading) return <BookSkeleton layout={layout} />;

  const spread = apiSpread ? parseFloat(apiSpread) : 0;
  const spreadDecimals = spread > 0 && spread < 1 ? 1 : 0;
  const lowestAsk = topAsks[topAsks.length - 1]
    ? parseFloat(topAsks[topAsks.length - 1].px)
    : 0;
  const spreadPct =
    lowestAsk > 0 ? ((spread / lowestAsk) * 100).toFixed(3) : "0.000";

  const layoutProps: LayoutProps = {
    topAsks,
    topBids,
    askDisplaySizes,
    bidDisplaySizes,
    askTotals,
    bidTotals,
    maxTotal,
    szDecimals,
    flashedPrices,
    spread,
    spreadDecimals,
    spreadPct,
    asset,
  };

  if (layout === "depth-view") return <DepthViewLayout {...layoutProps} />;
  if (layout === "buy-order") return <BuyOrderLayout {...layoutProps} />;
  if (layout === "sell-order") return <SellOrderLayout {...layoutProps} />;
  return <OrderBookLayout {...layoutProps} />;
}
