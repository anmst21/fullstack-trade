import { useState, useCallback, useRef } from "react";
import { Row, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { DEPTH_ROW_COUNT } from "@/helpers/constants";

export default function SellOrderLayout({
  topAsks,
  askDisplaySizes,
  askTotals,
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
    for (let i = hoveredIdx; i < topAsks.length; i++) {
      sumSz += askDisplaySizes[i];
      sumWt += askDisplaySizes[i] * parseFloat(topAsks[i].px);
    }
    agg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: askTotals[hoveredIdx] };
  }

  return (
    <div className="flex flex-col" onMouseLeave={clearHover}>
      <div
        className="flex flex-col"
        style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}
        onMouseOver={handleOver}
      >
        {topAsks.map((level, i) => (
          <div key={level.px} data-idx={i} ref={el => { rowEls.current[i] = el; }}>
            <Row
              px={level.px}
              sz={askDisplaySizes[i]}
              total={askTotals[i]}
              maxTotal={maxTotal}
              side="ask"
              szDecimals={szDecimals}
              flash={flashedPrices.has(level.px)}
              highlighted={hoveredIdx != null && i >= hoveredIdx}
              hoverBorder={i === hoveredIdx ? "top" : false}
            />
          </div>
        ))}
      </div>
      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />
      {agg && <AggTooltip {...agg} szDecimals={szDecimals} side="ask" anchorEl={rowEls.current[hoveredIdx!]} />}
    </div>
  );
}
