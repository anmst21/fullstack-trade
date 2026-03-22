import { useState, useCallback, useRef } from "react";
import { Row, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { ROW_COUNT } from "@/helpers/constants";
import { useHasHover } from "@/hooks/use-has-hover";

export default function OrderBookLayout({
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
    const idx = Number(row.dataset.idx);
    setHoveredAskIdx(idx);
    setHoveredBidIdx(null);
  }, []);

  const handleBidOver = useCallback((e: React.MouseEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    if (!row) return;
    const idx = Number(row.dataset.idx);
    setHoveredBidIdx(idx);
    setHoveredAskIdx(null);
  }, []);

  const safeAskIdx = hoveredAskIdx != null && hoveredAskIdx < topAsks.length ? hoveredAskIdx : null;
  const safeBidIdx = hoveredBidIdx != null && hoveredBidIdx < topBids.length ? hoveredBidIdx : null;

  let askAgg = null;
  if (safeAskIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = safeAskIdx; i < topAsks.length; i++) {
      sumSz += askDisplaySizes[i];
      sumWt += askDisplaySizes[i] * parseFloat(topAsks[i].px);
    }
    askAgg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: askTotals[safeAskIdx] };
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
    <div className="flex flex-col" onMouseLeave={hasHover ? clearHover : undefined}>
      <div
        className="flex flex-col justify-end overflow-visible"
        style={{ height: `calc(var(--row-h) * ${ROW_COUNT})` }}
        onMouseOver={hasHover ? handleAskOver : undefined}
      >
        {topAsks.map((level, i) => (
          <div key={level.px} data-idx={i} ref={el => { askRowEls.current[i] = el; }}>
            <Row
              px={level.px}
              sz={askDisplaySizes[i]}
              total={askTotals[i]}
              maxTotal={maxTotal}
              side="ask"
              szDecimals={szDecimals}
              flash={flashedPrices.has(level.px)}
              highlighted={safeAskIdx != null && i >= safeAskIdx}
              hoverBorder={i === safeAskIdx ? "top" : false}
            />
          </div>
        ))}
      </div>

      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />

      <div
        className="flex flex-col"
        style={{ height: `calc(var(--row-h) * ${ROW_COUNT})` }}
        onMouseOver={hasHover ? handleBidOver : undefined}
      >
        {topBids.map((level, i) => (
          <div key={level.px} data-idx={i} ref={el => { bidRowEls.current[i] = el; }}>
            <Row
              px={level.px}
              sz={bidDisplaySizes[i]}
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

      {hasHover && askAgg && <AggTooltip {...askAgg} szDecimals={szDecimals} side="ask" anchorEl={askRowEls.current[safeAskIdx!]} />}
      {hasHover && bidAgg && <AggTooltip {...bidAgg} szDecimals={szDecimals} side="bid" anchorEl={bidRowEls.current[safeBidIdx!]} />}
    </div>
  );
}
