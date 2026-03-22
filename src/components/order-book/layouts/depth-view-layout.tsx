import { useState, useCallback, useRef } from "react";
import cn from "classnames";
import { DepthRow, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { DEPTH_ROW_COUNT } from "@/helpers/constants";

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

  let askAgg = null;
  if (hoveredAskIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = 0; i <= hoveredAskIdx; i++) {
      sumSz += askDisplaySizes[i];
      sumWt += askDisplaySizes[i] * parseFloat(topAsks[i].px);
    }
    askAgg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: askTotals[hoveredAskIdx] };
  }

  let bidAgg = null;
  if (hoveredBidIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = 0; i <= hoveredBidIdx; i++) {
      sumSz += bidDisplaySizes[i];
      sumWt += bidDisplaySizes[i] * parseFloat(topBids[i].px);
    }
    bidAgg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: bidTotals[hoveredBidIdx] };
  }

  return (
    <div className="flex flex-col" onMouseLeave={clearHover}>
      <div className={cn(
        "relative grid grid-cols-2",
        "after:absolute after:left-1/2 after:top-0 after:bottom-0 after:w-px after:bg-white/10 after:z-10",
      )}>
        <div
          className="flex flex-col"
          style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}
          onMouseOver={handleAskOver}
        >
          {topAsks.map((level, i) => (
            <div key={level.px} data-idx={i} ref={el => { askRowEls.current[i] = el; }}>
              <DepthRow
                px={level.px}
                sz={askDisplaySizes[i]}
                maxTotal={maxTotal}
                side="ask"
                szDecimals={szDecimals}
                flash={flashedPrices.has(level.px)}
                highlighted={hoveredAskIdx != null && i <= hoveredAskIdx}
                hoverBorder={i === hoveredAskIdx ? "bottom" : false}
              />
            </div>
          ))}
        </div>
        <div
          className="flex flex-col"
          style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}
          onMouseOver={handleBidOver}
        >
          {topBids.map((level, i) => (
            <div key={level.px} data-idx={i} ref={el => { bidRowEls.current[i] = el; }}>
              <DepthRow
                px={level.px}
                sz={bidDisplaySizes[i]}
                maxTotal={maxTotal}
                side="bid"
                szDecimals={szDecimals}
                flash={flashedPrices.has(level.px)}
                highlighted={hoveredBidIdx != null && i <= hoveredBidIdx}
                hoverBorder={i === hoveredBidIdx ? "bottom" : false}
              />
            </div>
          ))}
        </div>
      </div>
      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />

      {askAgg && <AggTooltip {...askAgg} szDecimals={szDecimals} side="ask" anchorEl={askRowEls.current[hoveredAskIdx!]} anchor="left" borderEdge="bottom" />}
      {bidAgg && <AggTooltip {...bidAgg} szDecimals={szDecimals} side="bid" anchorEl={bidRowEls.current[hoveredBidIdx!]} anchor="right" />}
    </div>
  );
}
