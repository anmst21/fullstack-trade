import { useState, useCallback, useRef } from "react";
import { Row, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { ROW_COUNT } from "@/helpers/constants";

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

  let askAgg = null;
  if (hoveredAskIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = hoveredAskIdx; i < topAsks.length; i++) {
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
      <div
        className="flex flex-col justify-end overflow-visible"
        style={{ height: `calc(var(--row-h) * ${ROW_COUNT})` }}
        onMouseOver={handleAskOver}
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
              highlighted={hoveredAskIdx != null && i >= hoveredAskIdx}
              hoverBorder={i === hoveredAskIdx ? "top" : false}
            />
          </div>
        ))}
      </div>

      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />

      <div
        className="flex flex-col"
        style={{ height: `calc(var(--row-h) * ${ROW_COUNT})` }}
        onMouseOver={handleBidOver}
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
              highlighted={hoveredBidIdx != null && i <= hoveredBidIdx}
              hoverBorder={i === hoveredBidIdx ? "bottom" : false}
            />
          </div>
        ))}
      </div>

      {askAgg && <AggTooltip {...askAgg} szDecimals={szDecimals} side="ask" anchorEl={askRowEls.current[hoveredAskIdx!]} />}
      {bidAgg && <AggTooltip {...bidAgg} szDecimals={szDecimals} side="bid" anchorEl={bidRowEls.current[hoveredBidIdx!]} />}
    </div>
  );
}
