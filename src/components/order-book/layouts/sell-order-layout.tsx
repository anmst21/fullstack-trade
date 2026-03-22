import { useState, useCallback, useRef } from "react";
import { Row, SpreadBar, AggTooltip } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { useHasHover } from "@/hooks/use-has-hover";

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
  // Reverse so lowest price (closest to spread) is at top
  const revAsks = [...topAsks].reverse();
  const revSizes = [...askDisplaySizes].reverse();
  const revTotals = [...askTotals].reverse();

  const hasHover = useHasHover();
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
      sumSz += revSizes[i];
      sumWt += revSizes[i] * parseFloat(revAsks[i].px);
    }
    agg = { avgPx: sumSz > 0 ? sumWt / sumSz : 0, sumSz, sumTotal: revTotals[hoveredIdx] };
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'var(--book-scroll-h)' }} onMouseLeave={hasHover ? clearHover : undefined}>
      <div
        className="flex flex-col"
        onMouseOver={hasHover ? handleOver : undefined}
      >
        {revAsks.map((level, i) => (
          <div key={level.px} data-idx={i} ref={el => { rowEls.current[i] = el; }}>
            <Row
              px={level.px}
              sz={revSizes[i]}
              total={revTotals[i]}
              maxTotal={maxTotal}
              side="ask"
              szDecimals={szDecimals}
              flash={flashedPrices.has(level.px)}
              highlighted={hoveredIdx != null && i <= hoveredIdx}
              hoverBorder={i === hoveredIdx ? "bottom" : false}
            />
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />
      </div>
      {hasHover && agg && <AggTooltip {...agg} szDecimals={szDecimals} side="ask" anchorEl={rowEls.current[hoveredIdx!]} />}
    </div>
  );
}
