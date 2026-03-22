import { useState, useCallback, useRef } from "react";
import { Row, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { DEPTH_ROW_COUNT } from "@/helpers/constants";

export default function BuyOrderLayout({
  topBids,
  bidDisplaySizes,
  bidTotals,
  maxTotal,
  szDecimals,
  flashedPrices,
  spread,
  spreadDecimals,
  spreadPct,
}: LayoutProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const rowEls = useRef<(HTMLDivElement | null)[]>([]);
  const clearHover = useCallback(() => setHoveredIdx(null), []);

  const handleOver = useCallback((e: React.MouseEvent) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    if (!row) return;
    setHoveredIdx(Number(row.dataset.idx));
  }, []);

  let agg = null;
  if (hoveredIdx != null) {
    let sumSz = 0, sumWt = 0;
    for (let i = 0; i <= hoveredIdx; i++) {
      sumSz += bidDisplaySizes[i];
      sumWt += bidDisplaySizes[i] * parseFloat(topBids[i].px);
    }
    agg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: bidTotals[hoveredIdx] };
  }

  return (
    <div className="flex flex-col" onMouseLeave={clearHover}>
      <div
        className="flex flex-col"
        style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}
        onMouseOver={handleOver}
      >
        {topBids.map((level, i) => (
          <div key={level.px} data-idx={i} ref={el => { rowEls.current[i] = el; }}>
            <Row
              px={level.px}
              sz={bidDisplaySizes[i]}
              total={bidTotals[i]}
              maxTotal={maxTotal}
              side="bid"
              szDecimals={szDecimals}
              flash={flashedPrices.has(level.px)}
              highlighted={hoveredIdx != null && i <= hoveredIdx}
              hoverBorder={i === hoveredIdx ? "bottom" : false}
            />
          </div>
        ))}
      </div>
      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />
      {agg && <AggTooltip {...agg} szDecimals={szDecimals} side="bid" anchorEl={rowEls.current[hoveredIdx!]} />}
    </div>
  );
}
