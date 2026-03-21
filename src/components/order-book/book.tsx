"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { Book as BookData, Level } from "@/hooks/use-hyperliquid";
import BookSkeleton from "./skeleton";
import { useOrderBookLayout } from "@/context/order-book-layout";

const ROW_COUNT = 11;

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function applyGrouping(
  levels: Level[],
  group: number,
  side: "bid" | "ask",
): Level[] {
  if (group <= 0) return levels;
  const buckets = new Map<number, number>();
  for (const level of levels) {
    const price = parseFloat(level.px);
    const size = parseFloat(level.sz);
    const raw =
      side === "bid"
        ? Math.floor(price / group) * group
        : Math.ceil(price / group) * group;
    const bucket = parseFloat(raw.toPrecision(10));
    buckets.set(bucket, (buckets.get(bucket) || 0) + size);
  }
  return Array.from(buckets.entries()).map(([px, sz]) => ({
    px: String(px),
    sz: String(sz),
    n: 1,
  }));
}

interface RowProps {
  px: string;
  sz: number;
  total: number;
  maxTotal: number;
  side: "bid" | "ask";
  szDecimals: number;
  flash: boolean;
  barAlign?: "left" | "right";
}

const Row = memo(function Row({
  px,
  sz,
  total,
  maxTotal,
  side,
  szDecimals,
  flash,
  barAlign = "left",
}: RowProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const isBid = side === "bid";

  return (
    <div
      className={`relative grid grid-cols-3 text-sm py-[3px] px-3 cursor-default${flash ? ` flash-row-${side}` : ""}`}
    >
      <span
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [barAlign]: 0,
          width: `${pct}%`,
          background: isBid ? "rgba(161,255,0,0.08)" : "rgba(255,49,0,0.08)",
          transition: "width 200ms ease-out",
        }}
      />
      <span
        className="hover:font-semibold"
        style={{ color: isBid ? "#A1FF00" : "#FF3100" }}
      >
        {fmt(parseFloat(px), 0)}
      </span>
      <span className="text-right text-[#c8c8d0] hover:font-semibold">
        {fmt(sz, szDecimals)}
      </span>
      <span className="text-right text-[#c8c8d0] hover:font-semibold">
        {fmt(total, szDecimals)}
      </span>
    </div>
  );
});

// Compact row for depth-view (2-col layout: price + size only)
const DepthRow = memo(function DepthRow({
  px,
  sz,
  maxTotal,
  side,
  szDecimals,
  flash,
}: Omit<RowProps, "total" | "barAlign">) {
  const pct = maxTotal > 0 ? (sz / maxTotal) * 100 : 0;
  const isBid = side === "bid";

  return (
    <div
      className={`relative grid grid-cols-2 text-sm py-[3px] px-2 cursor-default${flash ? ` flash-row-${side}` : ""}`}
    >
      <span
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          [isBid ? "left" : "right"]: 0,
          width: `${pct}%`,
          background: isBid ? "rgba(161,255,0,0.08)" : "rgba(255,49,0,0.08)",
          transition: "width 200ms ease-out",
        }}
      />
      <span
        className="hover:font-semibold"
        style={{ color: isBid ? "#A1FF00" : "#FF3100" }}
      >
        {fmt(parseFloat(px), 0)}
      </span>
      <span
        className={`text-[#c8c8d0] hover:font-semibold ${isBid ? "text-right" : "text-left"}`}
      >
        {fmt(sz, szDecimals)}
      </span>
    </div>
  );
});

interface BookProps extends BookData {
  coin: string;
  asset: string;
  group: number;
}

export default function Book({
  bids,
  asks,
  spread: apiSpread,
  asset,
  group,
  coin,
}: BookProps) {
  const { layout } = useOrderBookLayout();
  const isLoading = bids.length === 0 && asks.length === 0;
  const isUSDC = asset === "USDC";
  const szDecimals = isUSDC ? 0 : 5;
  const rowCount = layout === "order-book" ? ROW_COUNT : ROW_COUNT * 2 + 3;

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

  const spread = apiSpread ? parseFloat(apiSpread) : 0;
  const spreadDecimals = spread > 0 && spread < 1 ? 1 : 0;
  const lowestAsk = topAsks[topAsks.length - 1]
    ? parseFloat(topAsks[topAsks.length - 1].px)
    : 0;
  const spreadPct =
    lowestAsk > 0 ? ((spread / lowestAsk) * 100).toFixed(3) : "0.000";

  if (isLoading) return <BookSkeleton asset={asset} coin={coin} />;

  // ── Depth View ────────────────────────────────────────────────────────────
  if (layout === "depth-view") {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-2 text-sm text-[#a7a7b7] py-2 border-b border-white/5">
          <div className="grid grid-cols-2 px-2">
            <span>Price</span>
            <span className="text-right">Size</span>
          </div>
          <div className="grid grid-cols-2 px-2 border-l border-white/5">
            <span>Price</span>
            <span className="text-left pl-1">Size</span>
          </div>
        </div>
        <div className="grid grid-cols-2">
          {/* Asks — price DESC (lowest at bottom), bar from right */}
          <div className="flex flex-col justify-end border-r border-white/5">
            {topAsks.map((level, i) => (
              <DepthRow
                key={level.px}
                px={level.px}
                sz={askDisplaySizes[i]}
                maxTotal={maxTotal}
                side="ask"
                szDecimals={szDecimals}
                flash={flashedPrices.has(level.px)}
              />
            ))}
          </div>
          {/* Bids — price DESC (highest at top), bar from left */}
          <div className="flex flex-col">
            {topBids.map((level, i) => (
              <DepthRow
                key={level.px}
                px={level.px}
                sz={bidDisplaySizes[i]}
                maxTotal={maxTotal}
                side="bid"
                szDecimals={szDecimals}
                flash={flashedPrices.has(level.px)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Buy Order (bids only) ─────────────────────────────────────────────────
  if (layout === "buy-order") {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-2">
          <span>Price</span>
          <span className="text-right">Size ({asset})</span>
          <span className="text-right">Total ({asset})</span>
        </div>
        <div className="flex flex-col">
          {topBids.map((level, i) => (
            <Row
              key={level.px}
              px={level.px}
              sz={bidDisplaySizes[i]}
              total={bidTotals[i]}
              maxTotal={maxTotal}
              side="bid"
              szDecimals={szDecimals}
              flash={flashedPrices.has(level.px)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Sell Order (asks only) ────────────────────────────────────────────────
  if (layout === "sell-order") {
    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-2">
          <span>Price</span>
          <span className="text-right">Size ({asset})</span>
          <span className="text-right">Total ({asset})</span>
        </div>
        <div className="flex flex-col">
          {topAsks.map((level, i) => (
            <Row
              key={level.px}
              px={level.px}
              sz={askDisplaySizes[i]}
              total={askTotals[i]}
              maxTotal={maxTotal}
              side="ask"
              szDecimals={szDecimals}
              flash={flashedPrices.has(level.px)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Order Book (default) ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* column headers */}
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-2">
        <span>Price</span>
        <span className="text-right">Size ({asset})</span>
        <span className="text-right">Total ({asset})</span>
      </div>

      {/* asks — fixed height, rows pinned to bottom so spread stays centered */}
      <div
        className="flex flex-col justify-end"
        style={{ height: ROW_COUNT * 26 }}
      >
        {topAsks.map((level, i) => (
          <Row
            key={level.px}
            px={level.px}
            sz={askDisplaySizes[i]}
            total={askTotals[i]}
            maxTotal={maxTotal}
            side="ask"
            szDecimals={szDecimals}
            flash={flashedPrices.has(level.px)}
          />
        ))}
      </div>

      {/* spread */}
      <div className="grid grid-cols-3 text-sm text-[#a7a7b7] px-3 py-[5px] bg-white/[0.03] cursor-default">
        <span>Spread</span>
        <span className="text-center">
          {spread > 0 ? fmt(spread, spreadDecimals) : "—"}
        </span>
        <span className="text-right">{spreadPct}%</span>
      </div>

      {/* bids — fixed height, rows from top */}
      <div className="flex flex-col" style={{ height: ROW_COUNT * 26 }}>
        {topBids.map((level, i) => (
          <Row
            key={level.px}
            px={level.px}
            sz={bidDisplaySizes[i]}
            total={bidTotals[i]}
            maxTotal={maxTotal}
            side="bid"
            szDecimals={szDecimals}
            flash={flashedPrices.has(level.px)}
          />
        ))}
      </div>
    </div>
  );
}
