import cn from "classnames";
import { DepthRow, SpreadBar } from "../book-rows";
import type { LayoutProps } from "../book-rows";
import { DEPTH_ROW_COUNT } from "@/helpers/constants";

export default function DepthViewLayout({
  topAsks,
  topBids,
  askDisplaySizes,
  bidDisplaySizes,
  maxTotal,
  szDecimals,
  flashedPrices,
  spread,
  spreadDecimals,
  spreadPct,
}: LayoutProps) {
  return (
    <div className="flex flex-col">
      <div className={cn(
        "relative grid grid-cols-2",
        "after:absolute after:left-1/2 after:top-0 after:bottom-0 after:w-px after:bg-white/10 after:z-10",
      )}>
        <div className="grid grid-cols-2 text-xs sm:text-sm text-[var(--text-secondary)] py-1 sm:py-2 px-3 border-b border-white/10">
          <span>Price</span>
          <span className="text-right">Size</span>
        </div>
        <div className="grid grid-cols-2 text-xs sm:text-sm text-[var(--text-secondary)] py-1 sm:py-2 px-3 border-b border-white/10">
          <span>Price</span>
          <span className="text-right">Size</span>
        </div>
        <div className="flex flex-col" style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}>
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
        <div className="flex flex-col" style={{ minHeight: `calc(var(--row-h) * ${DEPTH_ROW_COUNT})` }}>
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
      <SpreadBar spread={spread} spreadDecimals={spreadDecimals} spreadPct={spreadPct} />
    </div>
  );
}
