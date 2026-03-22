import { useState, useCallback, useRef } from "react";
import cn from "classnames";
import { DepthRow, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { useHasHover } from "@/hooks/use-has-hover";

export default function DepthViewLayout({
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
}: LayoutProps) {
  // Reverse asks so closest-to-spread (lowest price) is at top, matching Hyperliquid depth view
  const revAsks = [...topAsks].reverse();
  const revAskSizes = [...askDisplaySizes].reverse();
  const revAskTotals = [...askTotals].reverse();

  const hasHover = useHasHover();
  const [hoveredAskIdx, setHoveredAskIdx] = useState<number | null>(null);
  const [hoveredBidIdx, setHoveredBidIdx] = useState<number | null>(null);
  const askRowEls = useRef<(HTMLDivElement | null)[]>([]);
  const bidRowEls = useRef<(HTMLDivElement | null)[]>([]);

  const clearHover = useCallback(() => {
    setHoveredAskIdx(null);
    setHoveredBidIdx(null);
  }, []);

  const handleAskOver = useCallback((e: React.MouseEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    if (!row) return;
    setHoveredAskIdx(Number(row.dataset.idx));
    setHoveredBidIdx(null);
  }, []);

  const handleBidOver = useCallback((e: React.MouseEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    if (!row) return;
    setHoveredBidIdx(Number(row.dataset.idx));
    setHoveredAskIdx(null);
  }, []);

  const safeAskIdx = hoveredAskIdx != null && hoveredAskIdx < revAsks.length ? hoveredAskIdx : null;
  const safeBidIdx = hoveredBidIdx != null && hoveredBidIdx < topBids.length ? hoveredBidIdx : null;

  let askAgg = null;
  if (safeAskIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = 0; i <= safeAskIdx; i++) {
      sumSz += revAskSizes[i];
      sumWt += revAskSizes[i] * parseFloat(revAsks[i].px);
    }
    askAgg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: revAskTotals[safeAskIdx] };
  }

  let bidAgg = null;
  if (safeBidIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = 0; i <= safeBidIdx; i++) {
      sumSz += bidDisplaySizes[i];
      sumWt += bidDisplaySizes[i] * parseFloat(topBids[i].px);
    }
    bidAgg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: bidTotals[safeBidIdx] };
  }

  return (
    <div className={cn(
      "relative flex flex-col",
      "after:absolute after:left-1/2 after:top-0 after:w-px after:bg-white/10 after:z-10",
      "after:bottom-[var(--spread-h)]",
    )} style={{ minHeight: 'var(--book-scroll-h)' }} onMouseLeave={hasHover ? clearHover : undefined}>
      <div className="grid grid-cols-2">
        <div
          className="flex flex-col"

          onMouseOver={hasHover ? handleBidOver : undefined}
        >
          {topBids.map((level, i) => (
            <div key={level.px} data-idx={i} ref={el => { bidRowEls.current[i] = el; }}>
              <DepthRow
                px={level.px}
                sz={bidTotals[i]}
                total={bidTotals[i]}
                maxTotal={maxTotal}
                side="bid"
                szDecimals={szDecimals}
                flash={flashedPrices.has(level.px)}
                highlighted={safeBidIdx != null && i <= safeBidIdx}
                hoverBorder={i === safeBidIdx ? "bottom" : false}
              />
            </div>
          ))}
        </div>
        <div
          className="flex flex-col"

          onMouseOver={hasHover ? handleAskOver : undefined}
        >
          {revAsks.map((level, i) => (
            <div key={level.px} data-idx={i} ref={el => { askRowEls.current[i] = el; }}>
              <DepthRow
                px={level.px}
                sz={revAskTotals[i]}
                total={revAskTotals[i]}
                maxTotal={maxTotal}
                side="ask"
                szDecimals={szDecimals}
                flash={flashedPrices.has(level.px)}
                highlighted={safeAskIdx != null && i <= safeAskIdx}
                hoverBorder={i === safeAskIdx ? "bottom" : false}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />
      </div>

      {hasHover && bidAgg && <AggTooltip {...bidAgg} szDecimals={szDecimals} side="bid" anchorEl={bidRowEls.current[safeBidIdx!]} anchor="left" borderEdge="bottom" />}
      {hasHover && askAgg && <AggTooltip {...askAgg} szDecimals={szDecimals} side="ask" anchorEl={askRowEls.current[safeAskIdx!]} anchor="right" borderEdge="bottom" />}
    </div>
  );
}
